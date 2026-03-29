package tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentPlanResponse {
    private Integer planId;
    private Integer patientId;
    private String patientName;
    private String patientEmail;
    private Integer physiotherapistId;
    private String physiotherapistName;
    private String planName;
    private String diagnosis;
    private String therapeuticGoals;
    private String exercises;
    private Integer durationWeeks;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String notes;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
