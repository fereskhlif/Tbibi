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

    private String progressNote;

    private LocalDate scheduledDate;

    private String evaluationResult;

    private LocalTime startTime;

    private LocalTime endTime;

    @ManyToOne
    @JoinColumn(name = "patient_user_id", nullable = false)

    private User patient;
    @ManyToOne
    @JoinColumn(name = "physiotherapist_user_id", nullable = false)

    private User physiotherapist;
}