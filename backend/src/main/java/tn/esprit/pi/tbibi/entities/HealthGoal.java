package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String goalTitle;
    private String goalDescription;

    @Enumerated(EnumType.STRING)
    private GoalType goalType; // NUMERIC, BOOLEAN, HABIT_BASED

    private Double targetValue; // For NUMERIC goals (e.g., 10000 for steps)
    private String unit; // e.g., "steps", "liters", "hours"
    private Integer frequencyPerWeek; // For HABIT_BASED goals (e.g., 3 times per week)

    private Boolean achieved;
    private Double currentProgress; // Current value for NUMERIC goals
    private LocalDate createdDate;
    private LocalDate targetDate; // When the goal should be achieved
    private LocalDate lastUpdatedDate;

    // Relationship
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "healthGoal")
    private List<HealthGoalProgress> progressLogs;

    // Icon/category for UI (e.g., "weight-loss", "steps", "water-intake", "sleep")
    private String category;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ⭐ important for frontend
    @Transient
    private Long userId;
}