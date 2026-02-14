package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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

    @Column(nullable = false, length = 100)
    private String testName;

    @Column(length = 255)
    private String location;

    @Column(length = 100)
    private String nameLabo;

    @Column(length = 500)
    private String resultValue;

    @Column(length = 50)
    private String status;  // ✅ Juste un String, sans constantes

    @Column(nullable = false)
    private LocalDate testDate;

    // Relations
    @ManyToOne
    @JoinColumn(name = "patient_user_id", nullable = false)
    @ToString.Exclude
    private User patient;

    @OneToOne(mappedBy = "laboratoryResult", cascade = CascadeType.ALL)
    @ToString.Exclude
    private MedicalPictureAnalysis medicalPictureAnalysis;
}