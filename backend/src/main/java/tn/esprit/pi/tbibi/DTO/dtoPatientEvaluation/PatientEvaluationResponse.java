package tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEvaluationResponse {
    private Integer evaluationId;
    private Integer patientId;
    private String patientName;
    private String patientEmail;
    private Integer physiotherapistId;
    private String physiotherapistName;
    private LocalDate evaluationDate;
    private Integer painScale;
    private String painDescription;
    private Integer flexionDegrees;
    private Integer extensionDegrees;
    private String jointLocation;
    private String functionalLimitations;
    private String generalObservations;
    private String treatmentGoals;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
