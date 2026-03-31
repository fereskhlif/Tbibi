package tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Laboratory_ResultResponse {

    private Integer labId;
    private String testName;
    private String location;
    private String nameLabo;
    private String resultValue;
    private String status;
    private LocalDate testDate;

    // Infos laborantin
    private Integer laboratoryUserId;
    private String laboratoryUserName;

    // Infos patient
    private Integer patientId;
    private String patientName;

    // Infos médecin prescripteur
    private Integer prescribedByDoctorId;
    private String prescribedByDoctorName;

    // Notification
    private String notificationMessage;
    private boolean notificationSent;
    private LocalDate notificationDate;

    // ✅ NOUVEAU — Scheduled
    private LocalDateTime createdAt;
    private boolean scheduledNotifSent;
    
    // ✅ Gestion des priorités pour les demandes de tests
    private String priority; // Normal, Urgent, Critical
    private LocalDateTime requestedAt; // Date/heure de la demande
    private String requestNotes; // Notes du médecin sur la demande
}
