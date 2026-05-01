package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhysioBookingRequest {
    private Integer patientId;
    private Integer physiotherapistId;
    private String therapyType;
    private String reasonForVisit;
    private String preferredDate;  // e.g. "2026-06-01"
    private String patientName;
    private String patientEmail;
    private String patientPhone;
}
