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
<<<<<<< HEAD
    // Dans PrescriptionResponse.java — AJOUTER ces champs
    private Integer acteId;
    private Integer patientId;
    private String  patientName;
    private String  patientEmail;
=======
    private Integer acteId;
    private String  acteType;   // typeOfActe of the linked Acte (e.g., ANALYSE_DIAGNOSTIQUE)
    private Integer patientId;
    private String  patientName;
    private String  patientEmail;
    private Integer doctorId;
    private String  doctorName;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    private String note;
    private String date;           // String ISO → Angular le parse sans problème
    private String statusUpdatedAt;
    private PrescriptionStatus status;

}