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
    private LocalDate date;
    private LocalTime startTime;
    private Boolean isAvailable;
}