package tn.esprit.pi.tbibi.entities;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "treatment_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Integer planId;
    
    @ManyToOne
    @JoinColumn(name = "patient_user_id", nullable = false)
    private User patient;
    
    @ManyToOne
    @JoinColumn(name = "physiotherapist_user_id", nullable = false)
    private User physiotherapist;
    
    @Column(name = "plan_name", nullable = false)
    private String planName;
    
    @Column(name = "diagnosis")
    private String diagnosis;
    
    @Column(name = "therapeutic_goals", columnDefinition = "TEXT")
    private String therapeuticGoals;
    
    @Column(name = "exercises", columnDefinition = "TEXT")
    private String exercises; // JSON string or comma-separated
    
    @Column(name = "duration_weeks")
    private Integer durationWeeks;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "status")
    private String status; // Active, Completed, Suspended
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at")
    private LocalDate createdAt;
    
    @Column(name = "updated_at")
    private LocalDate updatedAt;
}
