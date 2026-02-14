package tn.esprit.pi.tbibi.entities;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "monitoring_chronic_disease")
public class MonitoringOfChronicDisease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chroid;

    private LocalDate dateOfDiagnosis;

    private String nameOfDisease;

    private LocalDate lastControl;

    private String plan;

    private String criticalAlert;
}
