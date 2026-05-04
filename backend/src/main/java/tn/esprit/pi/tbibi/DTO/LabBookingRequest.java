package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabBookingRequest {
    private Integer patientId;
    private Integer laboratoryId;
    private Long scheduleId; // the chosen slot — links date/time to the appointment
    private String analysisType;
    private String notes;
    private String preferredDate; // fallback date string e.g. "2026-06-01"
    private String patientName;
    private String patientEmail;
    private String patientPhone;
}
