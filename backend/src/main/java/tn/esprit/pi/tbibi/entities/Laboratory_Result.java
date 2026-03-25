package tn.esprit.pi.tbibi.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "laboratory_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Laboratory_Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer labId;

    private String testName;

    private String location;

    private String nameLabo;

    private String resultValue;

    private String status;

    private LocalDate testDate;

    @ManyToOne
    @JoinColumn(name = "patient_user_id", nullable = false)

    private User patient;

    @OneToOne(mappedBy = "laboratoryResult", cascade = CascadeType.ALL)

    private MedicalPictureAnalysis medicalPictureAnalysis;
    @OneToMany(cascade = CascadeType.ALL)
    private Set<User> Users;
    // In Laboratory_Result entity — add @JsonIgnore to any back-reference
    @ManyToOne
    @JoinColumn(name = "medical_file_id")
    @JsonIgnore  // ← ADD THIS if missing
    private MedicalReccords medicalReccords;
}