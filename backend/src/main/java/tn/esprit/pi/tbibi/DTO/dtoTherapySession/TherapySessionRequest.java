package tn.esprit.pi.tbibi.DTO.dtoTherapySession;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TherapySessionRequest {

    private String progressNote;
    private LocalDate scheduledDate;
    private String evaluationResult;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer patientId;
    private Integer physiotherapistId;
}