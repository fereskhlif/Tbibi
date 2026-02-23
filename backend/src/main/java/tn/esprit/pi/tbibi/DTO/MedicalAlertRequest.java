package tn.esprit.pi.tbibi.DTO;
import jakarta.persistence.*;
import lombok.*;
import tn.esprit.pi.tbibi.entities.User;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalAlertRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String message;

    private String severity; // LOW / MEDIUM / HIGH

    private LocalDateTime createdAt;

    private boolean readStatus;

    @ManyToOne
    private User user;
}