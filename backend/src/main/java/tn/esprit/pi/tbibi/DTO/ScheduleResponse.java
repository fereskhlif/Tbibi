package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleResponse {

    private Long scheduleId;
<<<<<<< HEAD
=======
    private Integer doctorId;
    private String doctorName;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    private LocalDate date;
    private LocalTime startTime;
    private Boolean isAvailable;
}