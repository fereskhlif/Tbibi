package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Top-level response returned by the Risk Segmentation endpoint.
 * Contains the three clusters (LOW / MEDIUM / HIGH) plus summary stats.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskSegmentationResponse {

    /** When this segmentation run was performed. */
    private LocalDateTime runAt;

    /** Total number of distinct patients analysed. */
    private int totalPatients;

    /** K-Means converged after this many iterations. */
    private int iterations;

    /** The three risk clusters. */
    private List<ClusterGroup> clusters;

    // ── Inner DTO ─────────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClusterGroup {

        /** LOW | MEDIUM | HIGH */
        private String label;

        /** Hex colour for the UI: green / amber / red */
        private String color;

        /** Icon shown in the UI */
        private String icon;

        /** Number of patients in this cluster */
        private int count;

        /** Average risk score of patients in this cluster (0–1) */
        private double avgRiskScore;

        /** Average % of critical readings in this cluster */
        private double avgCriticalPct;

        /** Average % of warning readings in this cluster */
        private double avgWarningPct;

        /** Patients belonging to this cluster */
        private List<PatientFeatureVector> patients;
    }
}
