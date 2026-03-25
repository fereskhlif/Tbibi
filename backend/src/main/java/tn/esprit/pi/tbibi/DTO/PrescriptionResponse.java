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
    private Integer acteId;
    private String  acteType;   // typeOfActe of the linked Acte (e.g., ANALYSE_DIAGNOSTIQUE)
    private Integer patientId;
    private String  patientName;
    private String  patientEmail;
    private Integer doctorId;
    private String  doctorName;
    private String note;
    private String date;           // String ISO → Angular le parse sans problème
    private String statusUpdatedAt;
    private PrescriptionStatus status;

}