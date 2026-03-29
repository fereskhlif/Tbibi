package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthGoalReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "health_goal_id")
    private HealthGoal healthGoal;

    private LocalTime reminderTime; // Time of day to send reminder
    private Boolean dailyReminder; // Send daily?
    private Boolean weekdayOnly; // Only on weekdays?
    private Boolean enabled; // Is reminder active?
    private String reminderMessage; // Custom reminder message
}
