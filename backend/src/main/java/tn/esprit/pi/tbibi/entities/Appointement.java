package tn.esprit.pi.tbibi.entities;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = "Appointement")
@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor //
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Appointement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long appointementId;
    private String doctor;
    private String availableDoctor;
    private LocalDate dateAppointement;
    @Enumerated(EnumType.STRING)
    private StatusAppointement statusAppointement;
    private String service;
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    Schedule schedule;
    @ManyToOne
    User user;

}
