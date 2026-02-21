package tn.esprit.pi.tbibi.DTO.dtoTherapySession;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TherapySessionResponse {

    private Integer sessionId;
    private String progressNote;
    private LocalDate scheduledDate;
    private String evaluationResult;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer patientId;
    private String patientFullName;
    private Integer physiotherapistId;
    private String physiotherapistFullName;
}