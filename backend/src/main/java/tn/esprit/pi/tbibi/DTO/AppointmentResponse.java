package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import tn.esprit.pi.tbibi.entities.StatusAppointement;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class AppointmentResponse {
    private Long appointmentId;
    private Integer userId;
    private String patientName;
    private String doctor;
    private String service;
    private String specialty;
    private String reasonForVisit;
    private StatusAppointement statusAppointement;
    private Long scheduleId;
    private String scheduleDate;
    private String scheduleTime;
    private String meetingLink;
}
