package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationRequest {
    private Integer userId;
    private String patientName;
    private String patientPhone;
    private String patientEmail;
    private Long scheduleId;
    private String doctor;
    private String specialty;
    private String reasonForVisit;
}
