package tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result;

import lombok.*;
import java.time.LocalDate;

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
    private String testDate; // ✅ String pour éviter les problèmes de sérialisation

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
    private String notificationDate; // ✅ String pour éviter les problèmes de sérialisation

    // ✅ NOUVEAU — Scheduled (String pour éviter les problèmes de sérialisation)
    private String createdAt;
    private boolean scheduledNotifSent;
    
    // ✅ Gestion des priorités pour les demandes de tests
    private String priority; // Normal, Urgent, Critical
    private String requestedAt; // Date/heure de la demande (String ISO format)
    private String requestNotes; // Notes du médecin sur la demande
    
    // ✅ Analyse d'image médicale associée
    private boolean hasMedicalPicture;
    private Integer medicalPictureId;
}
