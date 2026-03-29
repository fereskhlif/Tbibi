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

    private String therapyType;
    private String progressNote;
    private LocalDate scheduledDate;
    private String evaluationResult;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private String status;
    private Integer patientId;
    private Integer physiotherapistId;
    
    // Nouveaux champs pour la documentation de séance
    private String exercisesPerformed;
    private String sessionNotes;
    private LocalTime actualStartTime;
    private LocalTime actualEndTime;
    private Integer actualDurationMinutes;
}