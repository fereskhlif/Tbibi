package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "Teleconsultation")
@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)

public class Teleconsultation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;
    private String roomUrl;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String notes;
    @OneToOne
    private ConsultationRoom consultationRoom;
    @OneToOne(cascade = CascadeType.ALL , mappedBy = "teleconsultation")
    private Appointment appointment;
}
