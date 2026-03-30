package tn.esprit.pi.tbibi.DTO;

<<<<<<< HEAD

=======
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleRequest {

<<<<<<< HEAD
=======
    private Integer doctorId;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    private LocalDate date;
    private LocalTime startTime;
    private Boolean isAvailable;
}