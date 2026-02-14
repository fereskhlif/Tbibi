package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "therapy_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TherapySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer sessionId;

    @Column(columnDefinition = "TEXT")
    private String progressNote;

    @Column(nullable = false)
    private LocalDate scheduledDate;

    @Column(columnDefinition = "TEXT")
    private String evaluationResult;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    // ========================================
    // Relation avec User (Patient)
    // Many-to-One : Plusieurs sessions pour un patient
    // ========================================
    @ManyToOne
    @JoinColumn(name = "patient_user_id", nullable = false)
    @ToString.Exclude
    private User patient; // User avec role = PATIENT

    // ========================================
    // Relation avec User (Physiotherapist)
    // Many-to-One : Plusieurs sessions pour un physiothérapeute
    // ========================================
    @ManyToOne
    @JoinColumn(name = "physiotherapist_user_id", nullable = false)
    @ToString.Exclude
    private User physiotherapist; // User avec role = PHYSIO
}