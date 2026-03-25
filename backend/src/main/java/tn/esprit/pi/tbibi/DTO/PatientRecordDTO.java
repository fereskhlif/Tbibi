package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientRecordDTO {
    private int medicalFileId;
    private String patientName;
    private String patientEmail;
    private String medicalHistory;
    private String chronicDisease;
    private String repDoc;
    // New field
    private java.util.List<PrescriptionMinimalDTO> existingPrescriptions;
}
