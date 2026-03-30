package tn.esprit.pi.tbibi.entities;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.List;
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@AllArgsConstructor
@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
public class Acte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int acteId;
    private Date date;
    private String description;
    private String typeOfActe;
    @ManyToOne(cascade = CascadeType.ALL)
    MonitoringOfChronicDisease monitoringofchronicdisease;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "acte")
    @JsonIgnore
    private List<Prescription> prescriptions;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_file_id")
<<<<<<< HEAD
    @JsonIgnore
    private MedicalReccords medicalFile;  // ← must be exactly this name

=======
    private MedicalReccords medicalFile;  // ← must be exactly this name
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6

    /** ID du médecin qui a créé cet acte (null pour les anciens actes) */
    @Column(name = "doctor_id")
    private Integer doctorId;
}