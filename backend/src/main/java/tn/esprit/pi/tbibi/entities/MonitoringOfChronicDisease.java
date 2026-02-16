package tn.esprit.pi.tbibi.entities;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
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
public class MonitoringOfChronicDisease {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long chronicId;
    LocalDate dateOfDiagnosis;
    String nameOfDisease;
    Date lastcontrol;
    String plan;
    String criticalAlert;
    


}
