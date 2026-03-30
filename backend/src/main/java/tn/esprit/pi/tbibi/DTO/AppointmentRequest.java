package tn.esprit.pi.tbibi.DTO;

import lombok.*;
<<<<<<< HEAD
import tn.esprit.pi.tbibi.entities.StatusAppointement;
=======

>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
<<<<<<< HEAD

public class AppointmentRequest {
=======
public class AppointmentRequest {
    private Integer userId;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    private String doctor;
    private String service;
    private String specialty;
    private String reasonForVisit;
<<<<<<< HEAD
    private StatusAppointement status;
    private Long scheduleId;
}
=======
    private String statusAppointement;
    private Long scheduleId;
}
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
