package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthGoalReminderDto {

    private Long id;
    private Long healthGoalId;
    private LocalTime reminderTime;
    private Boolean dailyReminder;
    private Boolean weekdayOnly;
    private Boolean enabled;
    private String reminderMessage;
}
