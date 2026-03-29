package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Builder
@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;
    private String message;
    @Column(name = "is_read")
    private boolean read;
    private LocalDateTime createdDate;
    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointments;
    
    // ✅ NOUVEAU — Lien avec Laboratory_Result
    @ManyToOne
    @JoinColumn(name = "laboratory_result_id")
    private Laboratory_Result laboratoryResult;
    
    // ✅ NOUVEAU — Destinataire de la notification
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User recipient;
}
