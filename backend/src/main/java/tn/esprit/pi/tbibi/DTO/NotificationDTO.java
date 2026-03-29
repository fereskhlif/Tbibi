package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    private Integer patientId;
    private String message;
    private String testName;
    private String status;
    private LocalDate date;
}