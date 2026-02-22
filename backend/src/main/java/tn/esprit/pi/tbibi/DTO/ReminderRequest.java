package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReminderRequest {

    private LocalDateTime  heureRappel;
    private Integer frequence;
}