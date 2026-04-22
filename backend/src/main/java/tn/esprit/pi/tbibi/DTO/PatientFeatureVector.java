package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import java.util.List;

/**
 * Holds the computed health feature vector for a single patient,
 * plus the cluster assignment produced by K-Means and a personalised
 * care plan generated from that assessment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientFeatureVector {

    // ── Identity ─────────────────────────────────────────────────────────────

    private Integer patientId;
    private String  patientName;

    // ── Raw features (computed from chronic_condition readings) ───────────────

    /** Average blood-sugar reading (mg/dL). 0 if no readings. */
    private double avgBloodSugar;

    /** Average systolic blood pressure (mmHg). 0 if no readings. */
    private double avgBloodPressure;

    /** Average SpO2 (%). 0 if no readings. */
    private double avgOxygenSaturation;

    /** Average heart rate (bpm). 0 if no readings. */
    private double avgHeartRate;

    /** Fraction of ALL readings that are CRITICAL  (0–1). */
    private double criticalPct;

    /** Fraction of ALL readings that are WARNING  (0–1). */
    private double warningPct;

    /** Total number of readings for this patient. */
    private int totalReadings;

    // ── Derived ───────────────────────────────────────────────────────────────

    /**
     * Overall risk score in [0, 1] computed after normalisation.
     * Higher means higher risk.
     */
    private double riskScore;

    /** Cluster label assigned by K-Means: LOW | MEDIUM | HIGH */
    private String riskCluster;

    /**
     * Personalised care plan generated from the patient's vitals and
     * risk cluster. Contains daily-routine tips, monitoring advice,
     * warning signs, and (for HIGH risk) a call-doctor flag.
     */
    private CarePlan carePlan;
}
