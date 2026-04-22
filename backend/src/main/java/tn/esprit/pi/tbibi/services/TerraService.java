package tn.esprit.pi.tbibi.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.esprit.pi.tbibi.DTO.TerraVitalsDTO;
import tn.esprit.pi.tbibi.DTO.TerraWidgetDTO;
import tn.esprit.pi.tbibi.entities.TerraUser;
import tn.esprit.pi.tbibi.repositories.TerraUserRepo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Terra API integration service.
 *
 * Responsibilities:
 *  1. Generate a Terra widget session URL so the patient can connect their device.
 *  2. Handle the webhook callback when Terra notifies us of a new/updated user.
 *  3. Fetch the latest vitals (heart rate, SpO2) from Terra for a given patient.
 *
 * Terra docs: https://docs.tryterra.co
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TerraService {

    private final TerraUserRepo terraUserRepo;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${terra.dev-id}")
    private String devId;

    @Value("${terra.api-key}")
    private String apiKey;

    @Value("${terra.base-url:https://api.tryterra.co/v2}")
    private String baseUrl;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Widget session — patient connects their wearable
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Calls Terra POST /auth/generateWidgetSession.
     * Returns the widget URL + info about whether the patient is already connected.
     */
    public TerraWidgetDTO generateWidgetSession(Integer patientId) {
        TerraWidgetDTO result = new TerraWidgetDTO();

        // Check if already connected
        Optional<TerraUser> existing = terraUserRepo.findByPatientId(patientId);
        if (existing.isPresent()) {
            result.setAlreadyConnected(true);
            result.setProvider(existing.get().getProvider());
            result.setUrl(null);
            return result;
        }

        try {
            HttpHeaders headers = terraHeaders();
            Map<String, Object> body = new HashMap<>();
            body.put("reference_id", String.valueOf(patientId));
            body.put("language", "en");
            body.put("auth_success_redirect_url", "http://localhost:4200/patient/chronic-monitor?terra=connected");
            body.put("auth_failure_redirect_url", "http://localhost:4200/patient/chronic-monitor?terra=failed");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/generateWidgetSession", request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());
                result.setUrl(json.path("url").asText(null));
                result.setSessionId(json.path("session_id").asText(null));
                result.setAlreadyConnected(false);
                log.info("Generated Terra widget session for patient {}", patientId);
            }
        } catch (Exception e) {
            log.error("Failed to generate Terra widget session for patient {}: {}", patientId, e.getMessage());
            result.setUrl(null);
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Webhook handler — saves the Terra user_id when patient connects
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called by TerraController when Terra pushes a webhook event.
     * Handles: auth_success (new connection) and deauth (disconnection).
     */
    public void handleWebhook(String payload) {
        try {
            JsonNode json = objectMapper.readTree(payload);
            String type = json.path("type").asText("");

            log.info("Terra webhook received: type={}", type);

            if ("auth".equalsIgnoreCase(type)) {
                // Patient successfully connected their wearable
                JsonNode user = json.path("user");
                String terraUserId = user.path("user_id").asText(null);
                String referenceId = user.path("reference_id").asText(null); // this is our patientId
                String provider = user.path("provider").asText("UNKNOWN");

                if (terraUserId != null && referenceId != null) {
                    Integer patientId = Integer.parseInt(referenceId);
                    TerraUser tu = terraUserRepo.findByPatientId(patientId)
                            .orElse(TerraUser.builder().patientId(patientId).build());
                    tu.setTerraUserId(terraUserId);
                    tu.setProvider(provider.toUpperCase());
                    tu.setConnectedAt(LocalDateTime.now());
                    terraUserRepo.save(tu);
                    log.info("Saved Terra connection: patient={} terraUser={} provider={}", patientId, terraUserId, provider);
                }

            } else if ("deauth".equalsIgnoreCase(type)) {
                // Patient disconnected their device
                JsonNode user = json.path("user");
                String terraUserId = user.path("user_id").asText(null);
                if (terraUserId != null) {
                    terraUserRepo.findByTerraUserId(terraUserId).ifPresent(tu -> {
                        log.info("Patient {} disconnected Terra device ({})", tu.getPatientId(), terraUserId);
                        terraUserRepo.delete(tu);
                    });
                }

            } else {
                // Data payloads (activity, daily, body, sleep) — extract vitals and cache them
                JsonNode user = json.path("user");
                String terraUserId = user.path("user_id").asText(null);
                if (terraUserId != null) {
                    extractAndCacheVitals(terraUserId, json);
                }
            }

        } catch (Exception e) {
            log.error("Error processing Terra webhook: {}", e.getMessage(), e);
        }
    }

    /**
     * Extracts heart rate and SpO2 from an inbound Terra data payload
     * and caches the latest values in the TerraUser record.
     */
    private void extractAndCacheVitals(String terraUserId, JsonNode payload) {
        terraUserRepo.findByTerraUserId(terraUserId).ifPresent(tu -> {
            try {
                JsonNode dataArr = payload.path("data");
                if (dataArr.isArray() && dataArr.size() > 0) {
                    JsonNode first = dataArr.get(0);

                    // Heart rate from heart_rate_data.samples (latest sample)
                    JsonNode hrSamples = first.path("heart_rate_data").path("samples");
                    if (hrSamples.isArray() && hrSamples.size() > 0) {
                        JsonNode lastSample = hrSamples.get(hrSamples.size() - 1);
                        double hr = lastSample.path("heart_rate").asDouble(0);
                        if (hr > 0) {
                            tu.setLatestHeartRate(hr);
                            log.debug("Cached HR {} bpm for patient {}", hr, tu.getPatientId());
                        }
                    }

                    // SpO2 from oxygen_data.samples
                    JsonNode spo2Samples = first.path("oxygen_data").path("samples");
                    if (spo2Samples.isArray() && spo2Samples.size() > 0) {
                        JsonNode lastSample = spo2Samples.get(spo2Samples.size() - 1);
                        double spo2 = lastSample.path("percentage").asDouble(0);
                        if (spo2 > 0) {
                            tu.setLatestOxygen(spo2);
                            log.debug("Cached SpO2 {}% for patient {}", spo2, tu.getPatientId());
                        }
                    }

                    // Also try daily summary for resting HR
                    JsonNode restingHr = first.path("heart_rate_data").path("summary").path("resting_hr_bpm");
                    if (!restingHr.isMissingNode() && restingHr.asDouble(0) > 0 && tu.getLatestHeartRate() == null) {
                        tu.setLatestHeartRate(restingHr.asDouble());
                    }

                    tu.setLastFetchedAt(LocalDateTime.now());
                    terraUserRepo.save(tu);
                }
            } catch (Exception e) {
                log.warn("Could not cache vitals from webhook for terraUser {}: {}", terraUserId, e.getMessage());
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Fetch live vitals for a patient
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns the latest vitals for a patient.
     * - If the patient has no connected device → deviceConnected=false.
     * - First uses data pushed by Terra webhooks (cached in DB).
     * - Falls back to fetching directly from Terra REST API if cache is stale (> 30s old).
     */
    public TerraVitalsDTO getVitals(Integer patientId) {
        Optional<TerraUser> opt = terraUserRepo.findByPatientId(patientId);

        if (opt.isEmpty()) {
            return TerraVitalsDTO.builder()
                    .patientId(patientId)
                    .deviceConnected(false)
                    .statusMessage("No smartwatch connected. Ask the patient to connect their device.")
                    .build();
        }

        TerraUser tu = opt.get();

        // If cache is fresh (< 30 seconds old), return cached values
        boolean isCacheFresh = tu.getLastFetchedAt() != null &&
                tu.getLastFetchedAt().isAfter(LocalDateTime.now().minusSeconds(30));

        if (!isCacheFresh) {
            // Refresh from Terra REST API
            fetchAndUpdateFromTerra(tu);
        }

        // Build response from cached values
        return TerraVitalsDTO.builder()
                .patientId(patientId)
                .deviceConnected(true)
                .provider(tu.getProvider())
                .heartRate(tu.getLatestHeartRate())
                .oxygenSaturation(tu.getLatestOxygen())
                // Blood sugar & BP not available via consumer wearables → null
                .bloodSugar(null)
                .bloodPressureSystolic(null)
                .bloodPressureDiastolic(null)
                .lastUpdated(tu.getLastFetchedAt() != null
                        ? tu.getLastFetchedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null)
                .statusMessage(buildStatusMessage(tu))
                .build();
    }

    /**
     * Fetches today's activity data directly from Terra REST API and updates the cache.
     */
    private void fetchAndUpdateFromTerra(TerraUser tu) {
        try {
            String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
            String url = baseUrl + "/activity?user_id=" + tu.getTerraUserId()
                    + "&start_date=" + today + "&end_date=" + today + "&with_samples=true";

            HttpEntity<Void> request = new HttpEntity<>(terraHeaders());
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());
                extractAndCacheVitals(tu.getTerraUserId(), json);
                log.info("Refreshed Terra vitals for patient {} ({})", tu.getPatientId(), tu.getProvider());
            }

        } catch (Exception e) {
            log.warn("Could not fetch Terra vitals for patient {}: {}", tu.getPatientId(), e.getMessage());
            // Don't crash — return whatever is cached
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Connection status
    // ─────────────────────────────────────────────────────────────────────────

    public boolean isConnected(Integer patientId) {
        return terraUserRepo.existsByPatientId(patientId);
    }

    public void disconnect(Integer patientId) {
        terraUserRepo.findByPatientId(patientId).ifPresent(tu -> {
            log.info("Disconnecting Terra device for patient {}", patientId);
            terraUserRepo.delete(tu);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private HttpHeaders terraHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.set("dev-id", devId);
        h.set("x-api-key", apiKey);
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    private String buildStatusMessage(TerraUser tu) {
        if (tu.getLatestHeartRate() == null && tu.getLatestOxygen() == null) {
            return "Device connected (" + tu.getProvider() + ") — waiting for first reading...";
        }
        return "Live data from " + tu.getProvider() + " smartwatch";
    }
}
