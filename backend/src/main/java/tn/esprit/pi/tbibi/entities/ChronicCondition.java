package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chronic_condition")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChronicCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Patient this reading belongs to (optional link) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private User patient;

    /** Free-text patient name for display (stored even if patient account doesn't exist) */
    private String patientName;

    /** Type: BLOOD_SUGAR | BLOOD_PRESSURE | OXYGEN_SATURATION | HEART_RATE */
    @Column(nullable = false)
    private String conditionType;

    /** Numeric reading value (e.g. 120 for mmHg, 5.5 for mmol/L, 98 for %) */
    @Column(nullable = false)
    private Double value;

    /** Secondary value — used for diastolic blood pressure */
    private Double value2;

    /** Unit: mg/dL, mmHg, %, bpm */
    private String unit;

    /** AUTO-computed: NORMAL | WARNING | CRITICAL */
    @Column(nullable = false)
    private String severity;

    /** Doctor's notes */
    private String notes;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    /** The doctor who recorded this */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private User doctor;
}
