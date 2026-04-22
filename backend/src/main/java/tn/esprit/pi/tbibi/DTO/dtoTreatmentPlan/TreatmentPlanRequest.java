package tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentPlanRequest {
    private Integer patientId;
    private Integer physiotherapistId;
    private String planName;
    private String diagnosis;
    private String therapeuticGoals;
    private String exercises;
    private Integer durationWeeks;
    private LocalDate startDate;
    private String status;
    private String notes;
}
