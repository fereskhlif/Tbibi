package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import tn.esprit.pi.tbibi.entities.StatusAppointement;
<<<<<<< HEAD
=======

>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
<<<<<<< HEAD

public class AppointmentResponse {
    private Integer appointmentId;
=======
public class AppointmentResponse {
    private Long appointmentId;
    private Integer userId;
    private String patientName;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    private String doctor;
    private String service;
    private String specialty;
    private String reasonForVisit;
<<<<<<< HEAD
    private StatusAppointement status;
    private Long scheduleId;
    private String scheduleDate;
    private String scheduleTime;
}
=======
    private StatusAppointement statusAppointement;
    private Long scheduleId;
    private String scheduleDate;
    private String scheduleTime;
    private String meetingLink;
}
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
