package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import tn.esprit.pi.tbibi.entities.PrescriptionStatus;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionResponse {
    private int prescriptionID;
    // Dans PrescriptionResponse.java — AJOUTER ces champs
    private Integer acteId;
    private Integer patientId;
    private String  patientName;
    private String  patientEmail;
    private String note;
    private String date;           // String ISO → Angular le parse sans problème
    private String statusUpdatedAt;
    private PrescriptionStatus status;

}