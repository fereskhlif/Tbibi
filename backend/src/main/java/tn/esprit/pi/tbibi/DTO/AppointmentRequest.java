package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class AppointmentRequest {
    private Integer userId;
    private String doctor;
    private String service;
    private String specialty;
    private String reasonForVisit;
    private String statusAppointement;
    private Long scheduleId;
}
