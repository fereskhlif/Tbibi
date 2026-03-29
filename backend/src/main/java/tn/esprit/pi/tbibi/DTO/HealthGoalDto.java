package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import tn.esprit.pi.tbibi.entities.GoalType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthGoalDto {

    private Long id;
    private String goalTitle;
    private String goalDescription;
    private GoalType goalType;
    private Double targetValue;
    private String unit;
    private Integer frequencyPerWeek;
    private Boolean achieved;
    private Double currentProgress;
    private LocalDate createdDate;
    private LocalDate targetDate;
    private LocalDate lastUpdatedDate;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    
    // Nested progress logs
    private List<HealthGoalProgressDto> progressLogs;
}

