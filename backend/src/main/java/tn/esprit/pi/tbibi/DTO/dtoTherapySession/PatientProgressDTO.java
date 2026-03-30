package tn.esprit.pi.tbibi.DTO.dtoTherapySession;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProgressDTO {
    
    private Integer patientId;
    private String patientName;
    private String patientEmail;
    private String currentTherapyType;
    
    // Statistiques des séances
    private Integer totalSessions;
    private Integer completedSessions;
    private Integer scheduledSessions;
    private Integer cancelledSessions;
    
    // Progression
    private Double progressPercentage;
    
    // Dernière séance
    private String lastSessionDate;
    private String lastSessionType;
    private String lastSessionNote;
    
    // Prochaine séance
    private String nextSessionDate;
    private String nextSessionTime;
    private String nextSessionType;
    
    // Statut
    private String status; // Active, Completed, Inactive
}
