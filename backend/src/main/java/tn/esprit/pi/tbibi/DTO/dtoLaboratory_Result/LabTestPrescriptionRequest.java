package tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestPrescriptionRequest {
    private String patientEmail;
    private String testName;
    private String location;
    private String priority;
    private String requestNotes;
    private Integer prescribedByDoctorId;
}
