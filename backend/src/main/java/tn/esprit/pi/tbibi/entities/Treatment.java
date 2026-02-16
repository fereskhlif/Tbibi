package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor

@FieldDefaults(level = AccessLevel.PRIVATE)

public class Treatment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long treatmentId;
    Date startDate;
    Date endDate;
    String description;

    @ManyToOne
    Prescription prescription;

    @OneToMany(cascade = CascadeType.ALL, mappedBy="treatment")
    private List<Reminders> Reminders;
}
