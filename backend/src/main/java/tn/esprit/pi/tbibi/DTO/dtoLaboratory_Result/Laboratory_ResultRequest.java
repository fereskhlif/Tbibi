package tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Laboratory_ResultRequest {

    private String testName;
    private String location;
    private String nameLabo;
    private String resultValue;
    private String status;
    private LocalDate testDate;

    // ID du laborantin
    private Integer laboratoryUserId;

    // ID du patient concerné
    private Integer patientId;

    // ID du médecin qui a prescrit l'analyse
    private Integer prescribedByDoctorId;

    // ✅ NOUVEAU — Scheduled (optionnel, géré automatiquement dans le service)
    private LocalDateTime createdAt;
    
    // ✅ Gestion des priorités pour les demandes de tests
    private String priority; // Normal, Urgent, Critical
    private LocalDateTime requestedAt; // Date/heure de la demande
    private String requestNotes; // Notes du médecin sur la demande
}
