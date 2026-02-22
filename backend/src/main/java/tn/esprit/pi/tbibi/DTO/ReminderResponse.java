package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReminderResponse {

    private Long reminderId;
    private LocalDate heureRappel;
    private Integer frequence;
    private Long userId;
}