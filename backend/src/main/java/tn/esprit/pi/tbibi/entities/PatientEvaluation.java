package tn.esprit.pi.tbibi.entities;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEvaluation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evaluation_id")
    private Integer evaluationId;
    
    @ManyToOne
    @JoinColumn(name = "patient_user_id", nullable = false)
    private User patient;
    
    @ManyToOne
    @JoinColumn(name = "physiotherapist_user_id", nullable = false)
    private User physiotherapist;
    
    @Column(name = "evaluation_date")
    private LocalDate evaluationDate;
    
    // Échelle de douleur (0-10)
    @Column(name = "pain_scale")
    private Integer painScale; // 0 à 10
    
    @Column(name = "pain_description", columnDefinition = "TEXT")
    private String painDescription;
    
    // Amplitude articulaire
    @Column(name = "flexion_degrees")
    private Integer flexionDegrees;
    
    @Column(name = "extension_degrees")
    private Integer extensionDegrees;
    
    @Column(name = "joint_location")
    private String jointLocation; // Ex: Genou droit, Épaule gauche
    
    // Limitations fonctionnelles
    @Column(name = "functional_limitations", columnDefinition = "TEXT")
    private String functionalLimitations;
    
    // Observations générales
    @Column(name = "general_observations", columnDefinition = "TEXT")
    private String generalObservations;
    
    // Objectifs de traitement
    @Column(name = "treatment_goals", columnDefinition = "TEXT")
    private String treatmentGoals;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
