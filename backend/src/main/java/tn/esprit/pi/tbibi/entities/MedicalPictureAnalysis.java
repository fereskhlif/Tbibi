package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

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


    private String imageName;
    private String imageType;
    private String imagePath;
    private String category;


    @Column(columnDefinition = "TEXT")
    private String analysisResult;

    private Double confidenceScore;


    private String status;

    @Column(columnDefinition = "TEXT")
    private String doctorNote;


    private LocalDate uploadDate;
    private LocalDate validationDate;


    @OneToOne
    @JoinColumn(name = "lab_id", unique = true)
    @ToString.Exclude
    private Laboratory_Result laboratoryResult;
}