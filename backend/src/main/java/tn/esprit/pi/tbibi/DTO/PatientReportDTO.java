package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import java.util.List;
import java.util.Map;

/**
 * Complete medical report for a patient showing prescription evolution over time.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientReportDTO {

    // Patient info
    private Integer patientId;
    private String  patientName;
    private String  patientEmail;

    // Summary statistics
    private int totalPrescriptions;
    private int activePrescriptions;
    private int expiredPrescriptions;
    private int cancelledPrescriptions;
    private int pendingPrescriptions;
    private int dispensedPrescriptions;
    private int totalMedicinesEverPrescribed;
    private int uniqueMedicinesCount;

    // Most frequently prescribed medicines (medicineName → count)
    private List<MedicineFrequency> topMedicines;

    // Full chronological prescription list (enriched with medicines)
    private List<PrescriptionResponse> prescriptions;

    // Monthly breakdown for timeline chart: "2025-03" → count
    private Map<String, Long> prescriptionsPerMonth;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MedicineFrequency {
        private String medicineName;
        private String activeIngredient;
        private int count;
    }
}
