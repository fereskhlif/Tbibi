package tn.esprit.pi.tbibi.entities;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

<<<<<<< HEAD
=======
import java.util.ArrayList;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
import java.util.List;
import java.util.Set;
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    @Lob
    @Column(name = "medical_historuy", columnDefinition = "LONGTEXT")
    private String medical_historuy;
    private String chronic_diseas;
    private String rep_doc;
    // In MedicalReccords entity
<<<<<<< HEAD
    @OneToMany(cascade = CascadeType.ALL)
    @JsonIgnore  // ← make sure this is there
=======
    @OneToMany(mappedBy = "medicalReccords", cascade = CascadeType.ALL)
    @JsonIgnore
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    private Set<Laboratory_Result> laboratoryResults;
    @Column(columnDefinition = "TEXT")
    private String imageUrl;
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_file_id")
    @JsonIgnore
    private List<Acte> actes;
<<<<<<< HEAD
}
=======

    /** Images uploaded by the patient (analyses, scanners, old prescriptions) */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "medical_record_patient_images",
            joinColumns = @JoinColumn(name = "medical_record_id"))
    @Column(name = "image_path", columnDefinition = "TEXT")
    private List<String> patientImages = new ArrayList<>();
}
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
