package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.ChronicConditionRequest;
import tn.esprit.pi.tbibi.DTO.ChronicConditionResponse;
import tn.esprit.pi.tbibi.entities.ChronicCondition;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.ChronicConditionRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChronicConditionService {

    private final ChronicConditionRepo repo;
    private final UserRepo userRepo;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public ChronicConditionResponse create(ChronicConditionRequest req) {
        User doctor = userRepo.findById(req.getDoctorId().longValue())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + req.getDoctorId()));

        String severity = computeSeverity(req.getConditionType(), req.getValue(), req.getValue2());
        String unit = unitFor(req.getConditionType());

        ChronicCondition cc = ChronicCondition.builder()
                .doctor(doctor)
                .conditionType(req.getConditionType())
                .value(req.getValue())
                .value2(req.getValue2())
                .unit(unit)
                .severity(severity)
                .patientName(req.getPatientName())
                .notes(req.getNotes())
                .recordedAt(parseDateTime(req.getRecordedAt()))
                .build();

        // Optionally link to a patient account if the ID is known
        if (req.getPatientId() != null) {
            userRepo.findById(req.getPatientId().longValue()).ifPresent(p -> {
                cc.setPatient(p);
                // Use account name if no free-text name was provided
                if (cc.getPatientName() == null || cc.getPatientName().isBlank()) {
                    cc.setPatientName(p.getName());
                }
            });
        }

        return toResponse(repo.save(cc));
    }

    public ChronicConditionResponse update(Long id, ChronicConditionRequest req) {
        ChronicCondition cc = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Record not found: " + id));
        cc.setConditionType(req.getConditionType());
        cc.setValue(req.getValue());
        cc.setValue2(req.getValue2());
        cc.setUnit(unitFor(req.getConditionType()));
        cc.setSeverity(computeSeverity(req.getConditionType(), req.getValue(), req.getValue2()));
        cc.setNotes(req.getNotes());
        return toResponse(repo.save(cc));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new EntityNotFoundException("Record not found: " + id);
        repo.deleteById(id);
    }

    public List<ChronicConditionResponse> getByPatient(Integer patientId) {
        return repo.findByPatientUserIdOrderByRecordedAtDesc(patientId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ChronicConditionResponse> getByDoctor(Integer doctorId) {
        return repo.findByDoctorUserIdOrderByRecordedAtDesc(doctorId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ChronicConditionResponse> getCriticalByDoctor(Integer doctorId) {
        return repo.findBySeverityAndDoctorUserId("CRITICAL", doctorId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Severity computation ──────────────────────────────────────────────────

    /**
     * Medical thresholds:
     *  BLOOD_SUGAR (mg/dL)       : <70 CRITICAL (hypoglycemia), 70-99 NORMAL, 100-125 WARNING (pre-diabetic), >=126 CRITICAL (diabetic)
     *  BLOOD_PRESSURE systolic   : <90 CRITICAL (hypotension), 90-119 NORMAL, 120-139 WARNING, >=140 CRITICAL (hypertension)
     *  OXYGEN_SATURATION (%)     : >=95 NORMAL, 90-94 WARNING, <90 CRITICAL (hypoxia / suffocation risk)
     *  HEART_RATE (bpm)          : 60-100 NORMAL, 40-59 or 101-120 WARNING, <40 or >120 CRITICAL
     */
    public String computeSeverity(String type, Double value, Double value2) {
        if (value == null) return "NORMAL";
        return switch (type) {
            case "BLOOD_SUGAR" -> {
                if (value < 70 || value >= 126) yield "CRITICAL";
                if (value >= 100) yield "WARNING";
                yield "NORMAL";
            }
            case "BLOOD_PRESSURE" -> {
                // systolic
                if (value < 90 || value >= 140) yield "CRITICAL";
                if (value >= 120) yield "WARNING";
                yield "NORMAL";
            }
            case "OXYGEN_SATURATION" -> {
                if (value < 90) yield "CRITICAL";
                if (value < 95) yield "WARNING";
                yield "NORMAL";
            }
            case "HEART_RATE" -> {
                if (value < 40 || value > 120) yield "CRITICAL";
                if (value < 60 || value > 100) yield "WARNING";
                yield "NORMAL";
            }
            default -> "NORMAL";
        };
    }

    private String unitFor(String type) {
        return switch (type) {
            case "BLOOD_SUGAR" -> "mg/dL";
            case "BLOOD_PRESSURE" -> "mmHg";
            case "OXYGEN_SATURATION" -> "%";
            case "HEART_RATE" -> "bpm";
            default -> "";
        };
    }

    private String displayValue(ChronicCondition cc) {
        if ("BLOOD_PRESSURE".equals(cc.getConditionType()) && cc.getValue2() != null) {
            return cc.getValue().intValue() + "/" + cc.getValue2().intValue() + " " + cc.getUnit();
        }
        return cc.getValue() + " " + cc.getUnit();
    }

    private ChronicConditionResponse toResponse(ChronicCondition cc) {
        String name = cc.getPatientName();
        if ((name == null || name.isBlank()) && cc.getPatient() != null) {
            name = cc.getPatient().getName();
        }
        return ChronicConditionResponse.builder()
                .id(cc.getId())
                .patientId(cc.getPatient() != null ? cc.getPatient().getUserId() : null)
                .patientName(name != null ? name : "Unknown")
                .doctorId(cc.getDoctor() != null ? cc.getDoctor().getUserId() : null)
                .conditionType(cc.getConditionType())
                .value(cc.getValue())
                .value2(cc.getValue2())
                .unit(cc.getUnit())
                .severity(cc.getSeverity())
                .notes(cc.getNotes())
                .recordedAt(cc.getRecordedAt())
                .displayValue(displayValue(cc))
                .build();
    }

    private LocalDateTime parseDateTime(String s) {
        if (s == null || s.isBlank()) return LocalDateTime.now();
        try {
            if (s.length() == 16) s = s + ":00"; // "2026-03-25T03:04" → add :00
            return LocalDateTime.parse(s);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}
