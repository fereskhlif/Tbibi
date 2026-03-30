package tn.esprit.pi.tbibi.entities;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultationRoom")
@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConsultationRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer roomId;
    private String roomCode;
    private LocalDateTime createdAt ;
    private LocalDateTime expiresAt ;
    @OneToOne(cascade = CascadeType.ALL , mappedBy = "consultationRoom")
    private Teleconsultation teleconsultation;
}
