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

    private String therapyType; // Type de thérapie (ex: Massage, Rééducation, etc.)

    private String progressNote;

    private LocalDate scheduledDate;

    private String evaluationResult;

    private LocalTime startTime;

    private LocalTime endTime;

    private Integer durationMinutes; // Durée prévue en minutes

    @Column(nullable = false)
    private String status = "Scheduled"; // Scheduled, In Progress, Completed, Cancelled, Rescheduled

    // Nouveaux champs pour la documentation de séance
    @Column(columnDefinition = "TEXT")
    private String exercisesPerformed; // Exercices effectués pendant la séance

    @Column(columnDefinition = "TEXT")
    private String sessionNotes; // Notes de session détaillées

    private LocalTime actualStartTime; // Heure réelle de début

    private LocalTime actualEndTime; // Heure réelle de fin

    private Integer actualDurationMinutes; // Durée réelle en minutes

    @ManyToOne
    @JoinColumn(name = "patient_user_id", nullable = false)
    private User patient;

    @ManyToOne
    @JoinColumn(name = "physiotherapist_user_id", nullable = false)
    private User physiotherapist;
}