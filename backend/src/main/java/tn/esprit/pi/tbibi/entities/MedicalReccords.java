package tn.esprit.pi.tbibi.entities;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;
@AllArgsConstructor
@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
public class MedicalReccords {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int medicalfile_id;
    private String imageLabo;
    private String result_ia;
    private String medical_historuy;
    private String chronic_diseas;
    private String rep_doc;
    @OneToMany(cascade = CascadeType.ALL)
    private Set<Laboratory_Result> laboratoryResults;
}