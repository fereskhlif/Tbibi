package tn.esprit.pi.tbibi.entities;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "medical_picture_analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MedicalPictureAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer picId;
    @Column(columnDefinition = "TEXT")
    private String history;
    @OneToOne
    @JoinColumn(name = "lab_id", unique = true)
    private Laboratory_Result laboratoryResult;
}