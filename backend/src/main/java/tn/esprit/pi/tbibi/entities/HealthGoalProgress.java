package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthGoalProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "health_goal_id")
    private HealthGoal healthGoal;

    private LocalDate logDate;
    @Column(name = "metric_value")
    private Double value; // For NUMERIC goals (e.g., 8500 steps on this day)
    private Boolean completed; // For BOOLEAN and HABIT_BASED goals
    private String notes; // Optional notes for the log entry
    private LocalDateTime recordedAt;

    private Double weeklyProgress; // For weekly summary
}
