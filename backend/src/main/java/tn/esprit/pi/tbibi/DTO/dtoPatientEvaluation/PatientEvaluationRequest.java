package tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEvaluationRequest {
    private Integer patientId;
    private Integer physiotherapistId;
    private LocalDate evaluationDate;
    private Integer painScale; // 0-10
    private String painDescription;
    private Integer flexionDegrees;
    private Integer extensionDegrees;
    private String jointLocation;
    private String functionalLimitations;
    private String generalObservations;
    private String treatmentGoals;
}
