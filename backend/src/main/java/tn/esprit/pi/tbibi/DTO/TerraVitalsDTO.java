package tn.esprit.pi.tbibi.DTO;

import lombok.*;

/**
 * Returned to the Angular frontend when it asks for live vitals.
 * Fields that cannot be retrieved from the wearable are null.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TerraVitalsDTO {

    /** Patient's Tbibi ID */
    private Integer patientId;

    /** Whether the patient has a connected Terra device */
    private boolean deviceConnected;

    /** The wearable brand (GARMIN, FITBIT, GOOGLE_FIT, …) */
    private String provider;

    /** Heart rate in bpm — from Terra if available, null otherwise */
    private Double heartRate;

    /** Oxygen saturation in % — from Terra if available, null otherwise */
    private Double oxygenSaturation;

    /**
     * Blood sugar in mg/dL.
     * Consumer wearables do NOT provide this; always null unless a
     * medical CGM (e.g. Dexcom) is connected via Terra.
     */
    private Double bloodSugar;

    /**
     * Systolic blood pressure in mmHg.
     * Only available on medical-grade BP monitors connected via Terra.
     */
    private Double bloodPressureSystolic;

    /** Diastolic blood pressure in mmHg */
    private Double bloodPressureDiastolic;

    /** ISO timestamp of the most recent reading fetched from Terra */
    private String lastUpdated;

    /** Human-readable status message for the UI */
    private String statusMessage;
}
