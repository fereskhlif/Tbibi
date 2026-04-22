package tn.esprit.pi.tbibi.services;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.esprit.pi.tbibi.DTO.CarePlan;
import tn.esprit.pi.tbibi.DTO.PatientFeatureVector;
import tn.esprit.pi.tbibi.DTO.RiskSegmentationResponse;
import tn.esprit.pi.tbibi.entities.ChronicCondition;
import tn.esprit.pi.tbibi.repositories.ChronicConditionRepo;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Patient Risk Segmentation — Java orchestrator + Python AI engine.
 *
 * Pipeline:
 * 1.  Load ChronicCondition rows from the database.
 * 2.  Group by patient → compute a 6-dimensional feature vector per patient.
 * 3.  POST the feature vectors to the Python micro-service (GET /segment).
 * 4.  Python runs scikit-learn K-Means, assigns LOW / MEDIUM / HIGH clusters,
 *     and generates a personalised CarePlan for every patient.
 * 5.  Return the Python response as the REST response (already structured).
 *
 * If the Python service is unavailable the service throws a clear error
 * so the frontend can display a helpful message.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RiskSegmentationService {

    private final ChronicConditionRepo repo;
    private final RestTemplate          restTemplate;

    /** URL of the Python AI micro-service.  Override via application.properties. */
    @Value("${tbibi.python.segment-url:http://localhost:5000/segment}")
    private String segmentUrl;

    // ── Public API ────────────────────────────────────────────────────────────

    public RiskSegmentationResponse run() {
        // 1. Load all readings that belong to a real PATIENT account (LEFT JOIN)
        List<ChronicCondition> all = repo.findAllWithPatient();
        if (all.isEmpty()) return emptyResponse();

        // 2. Group by stable key
        Map<String, List<ChronicCondition>> byKey = new LinkedHashMap<>();
        for (ChronicCondition c : all) {
            String key;
            if (c.getPatient() != null) {
                String role = c.getPatient().getRole() != null
                        ? c.getPatient().getRole().getRoleName() : "";
                if (!role.equalsIgnoreCase("PATIENT")) continue;
                key = "id:" + c.getPatient().getUserId();
            } else if (c.getPatientName() != null && !c.getPatientName().isBlank()) {
                key = "name:" + c.getPatientName().trim().toLowerCase();
            } else {
                continue;
            }
            byKey.computeIfAbsent(key, k -> new ArrayList<>()).add(c);
        }

        if (byKey.isEmpty()) return emptyResponse();

        // 3. Build feature vectors (pure Java — no clustering here)
        List<PatientFeatureVector> vectors = byKey.entrySet().stream()
                .map(e -> buildFeatureVector(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // 4. Delegate clustering + care-plan generation to Python
        return callPythonSegmentation(vectors);
    }

    // ── Python delegation ─────────────────────────────────────────────────────

    /**
     * POST the feature vectors to the Python AI service.
     * The Python service runs scikit-learn K-Means, assigns clusters,
     * and generates a personalised care plan for every patient.
     */
    private RiskSegmentationResponse callPythonSegmentation(
            List<PatientFeatureVector> vectors) {

        // Build the JSON body  { "patients": [ ... ] }
        List<Map<String, Object>> patients = vectors.stream()
                .map(this::vectorToMap)
                .collect(Collectors.toList());

        Map<String, Object> body = Map.of("patients", patients);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        log.info("🔬 Calling Python /segment with {} patient(s) → {}", vectors.size(), segmentUrl);

        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> raw =
                    (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>)
                    restTemplate.postForEntity(segmentUrl, request, Map.class);

            if (raw.getBody() == null)
                throw new IllegalStateException("Python service returned empty body");

            // Map the Python response to our Java DTOs
            return mapPythonResponse(raw.getBody(), vectors);

        } catch (Exception ex) {
            log.error("❌ Python segmentation service error: {}", ex.getMessage());
            throw new RuntimeException(
                "AI segmentation service is unavailable. " +
                "Please make sure the Python micro-service is running on " + segmentUrl, ex);
        }
    }

    /** Convert a PatientFeatureVector to a plain Map for JSON serialisation. */
    @SuppressWarnings("unchecked")
    private Map<String, Object> vectorToMap(PatientFeatureVector v) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("patientId",           v.getPatientId());
        m.put("patientName",         v.getPatientName());
        m.put("avgBloodSugar",       v.getAvgBloodSugar());
        m.put("avgBloodPressure",    v.getAvgBloodPressure());
        m.put("avgOxygenSaturation", v.getAvgOxygenSaturation());
        m.put("avgHeartRate",        v.getAvgHeartRate());
        m.put("criticalPct",         v.getCriticalPct());
        m.put("warningPct",          v.getWarningPct());
        m.put("totalReadings",       v.getTotalReadings());
        return m;
    }

    /**
     * Convert the raw Python JSON Map into our {@link RiskSegmentationResponse}.
     * The Python clusters already contain patientId, riskCluster, riskScore and carePlan.
     */
    @SuppressWarnings("unchecked")
    private RiskSegmentationResponse mapPythonResponse(Map<String, Object> raw,
                                                        List<PatientFeatureVector> original) {

        // Index original vectors by patientId for quick lookup
        Map<Integer, PatientFeatureVector> byId = new HashMap<>();
        for (PatientFeatureVector v : original) {
            if (v.getPatientId() != null) byId.put(v.getPatientId(), v);
        }

        String runAt = String.valueOf(raw.getOrDefault("runAt", LocalDateTime.now().toString()));
        int totalPat = ((Number) raw.getOrDefault("totalPatients", 0)).intValue();
        int iters    = ((Number) raw.getOrDefault("iterations",    0)).intValue();

        List<Map<String, Object>> rawClusters =
                (List<Map<String, Object>>) raw.get("clusters");
        List<RiskSegmentationResponse.ClusterGroup> clusters = new ArrayList<>();

        String[][] meta = {
            { "LOW",    "#22c55e", "🟢" },
            { "MEDIUM", "#f59e0b", "🟡" },
            { "HIGH",   "#ef4444", "🔴" },
        };

        for (String[] m : meta) {
            String targetLabel = m[0];
            List<PatientFeatureVector> members = new ArrayList<>();

            if (rawClusters != null) {
                for (Map<String, Object> cMap : rawClusters) {
                    if (!targetLabel.equals(cMap.get("label"))) continue;

                    List<Map<String, Object>> rawPats =
                            (List<Map<String, Object>>) cMap.get("patients");
                    if (rawPats == null) continue;

                    for (Map<String, Object> pMap : rawPats) {
                        members.add(buildFvFromPythonMap(pMap, byId));
                    }
                }
            }

            double avgRisk = members.stream()
                    .mapToDouble(PatientFeatureVector::getRiskScore).average().orElse(0);
            double avgCrit = members.stream()
                    .mapToDouble(PatientFeatureVector::getCriticalPct).average().orElse(0);
            double avgWarn = members.stream()
                    .mapToDouble(PatientFeatureVector::getWarningPct).average().orElse(0);

            clusters.add(RiskSegmentationResponse.ClusterGroup.builder()
                    .label(targetLabel).color(m[1]).icon(m[2])
                    .count(members.size())
                    .avgRiskScore(avgRisk).avgCriticalPct(avgCrit).avgWarningPct(avgWarn)
                    .patients(members)
                    .build());
        }

        return RiskSegmentationResponse.builder()
                .runAt(LocalDateTime.now())
                .totalPatients(totalPat)
                .iterations(iters)
                .clusters(clusters)
                .build();
    }

    /** Build a PatientFeatureVector from a Python patient result map. */
    @SuppressWarnings("unchecked")
    private PatientFeatureVector buildFvFromPythonMap(Map<String, Object> p,
                                                      Map<Integer, PatientFeatureVector> byId) {
        Integer pid = p.get("patientId") != null
                ? ((Number) p.get("patientId")).intValue() : null;

        // Start from original vector if we have it (retains full precision)
        PatientFeatureVector base = (pid != null && byId.containsKey(pid))
                ? byId.get(pid)
                : PatientFeatureVector.builder()
                        .patientId(pid)
                        .patientName(String.valueOf(p.getOrDefault("patientName", "Unknown")))
                        .build();

        base.setRiskScore  (((Number) p.getOrDefault("riskScore",   0)).doubleValue());
        base.setRiskCluster(String.valueOf(p.getOrDefault("riskCluster", "LOW")));
        base.setCarePlan   (mapCarePlan((Map<String, Object>) p.get("carePlan")));
        return base;
    }

    /** Convert the Python carePlan map to our Java CarePlan DTO. */
    @SuppressWarnings("unchecked")
    private CarePlan mapCarePlan(Map<String, Object> cp) {
        if (cp == null) return null;
        String  headline   = String.valueOf(cp.getOrDefault("headline", ""));
        boolean callDoctor = Boolean.TRUE.equals(cp.get("callDoctorNow"));

        List<Map<String, Object>> rawSections =
                (List<Map<String, Object>>) cp.get("sections");
        List<CarePlan.Section> sections = new ArrayList<>();

        if (rawSections != null) {
            for (Map<String, Object> s : rawSections) {
                List<String> tips  = toStringList((List<?>) s.get("tips"));
                List<String> warns = toStringList((List<?>) s.get("warningSigns"));
                sections.add(CarePlan.Section.builder()
                        .title       (String.valueOf(s.getOrDefault("title",    "")))
                        .subtitle    (String.valueOf(s.getOrDefault("subtitle", "")))
                        .tips        (tips)
                        .warningSigns(warns)
                        .build());
            }
        }

        return CarePlan.builder()
                .headline(headline)
                .callDoctorNow(callDoctor)
                .sections(sections)
                .build();
    }

    private List<String> toStringList(List<?> raw) {
        if (raw == null) return Collections.emptyList();
        return raw.stream().map(Object::toString).collect(Collectors.toList());
    }

    // ── Feature extraction (DB → feature vector) ──────────────────────────────

    private PatientFeatureVector buildFeatureVector(String key,
            List<ChronicCondition> readings) {
        Integer patientId = null;
        String  name;

        if (key.startsWith("id:")) {
            patientId = Integer.parseInt(key.substring(3));
            ChronicCondition first = readings.get(0);
            name = first.getPatientName();
            if ((name == null || name.isBlank()) && first.getPatient() != null)
                name = first.getPatient().getName();
            if (name == null || name.isBlank()) name = "Patient #" + patientId;
        } else {
            name = readings.get(0).getPatientName();
            if (name == null || name.isBlank()) name = key.substring(5);
        }

        long total    = readings.size();
        long critical = readings.stream().filter(r -> "CRITICAL".equals(r.getSeverity())).count();
        long warning  = readings.stream().filter(r -> "WARNING" .equals(r.getSeverity())).count();

        return PatientFeatureVector.builder()
                .patientId            (patientId)
                .patientName          (name)
                .avgBloodSugar        (avgOf(readings, "BLOOD_SUGAR")        .orElse(90.0))
                .avgBloodPressure     (avgOf(readings, "BLOOD_PRESSURE")     .orElse(110.0))
                .avgOxygenSaturation  (avgOf(readings, "OXYGEN_SATURATION")  .orElse(97.0))
                .avgHeartRate         (avgOf(readings, "HEART_RATE")         .orElse(72.0))
                .criticalPct          ((double) critical / total)
                .warningPct           ((double) warning  / total)
                .totalReadings        ((int) total)
                .build();
    }

    private OptionalDouble avgOf(List<ChronicCondition> readings, String type) {
        return readings.stream()
                .filter(r -> type.equals(r.getConditionType()) && r.getValue() != null)
                .mapToDouble(ChronicCondition::getValue)
                .average();
    }

    // ── Empty response ────────────────────────────────────────────────────────

    private RiskSegmentationResponse emptyResponse() {
        return RiskSegmentationResponse.builder()
                .runAt(LocalDateTime.now())
                .totalPatients(0)
                .iterations(0)
                .clusters(Collections.emptyList())
                .build();
    }
}
