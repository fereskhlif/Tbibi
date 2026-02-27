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
}
