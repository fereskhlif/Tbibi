package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthGoalProgressDto {

    private Long id;
    private Long healthGoalId;
    private LocalDate logDate;
    private Double value;
    private Boolean completed;
    private String notes;
    private LocalDateTime recordedAt;
    private Double weeklyProgress;
}
