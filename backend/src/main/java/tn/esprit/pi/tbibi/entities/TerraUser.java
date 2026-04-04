package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Stores the mapping between a Tbibi patient and their Terra wearable account.
 * When a patient connects their smartwatch via the Terra widget, Terra pushes
 * their terra_user_id to our webhook and we store it here.
 */
@Entity
@Table(name = "terra_user")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TerraUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Tbibi internal patient ID */
    @Column(name = "patient_id", nullable = false, unique = true)
    private Integer patientId;

    /** Terra's user_id returned after the patient connects their device */
    @Column(name = "terra_user_id", nullable = false)
    private String terraUserId;

    /** The wearable provider (GARMIN, FITBIT, GOOGLE_FIT, etc.) */
    @Column(name = "provider")
    private String provider;

    /** When the patient connected their device */
    @Column(name = "connected_at", nullable = false)
    private LocalDateTime connectedAt;

    /** Latest cached heart rate from Terra (bpm) */
    @Column(name = "latest_heart_rate")
    private Double latestHeartRate;

    /** Latest cached oxygen saturation from Terra (%) */
    @Column(name = "latest_oxygen")
    private Double latestOxygen;

    /** When vitals were last fetched from Terra */
    @Column(name = "last_fetched_at")
    private LocalDateTime lastFetchedAt;
}
