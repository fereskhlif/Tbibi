package tn.esprit.pi.tbibi.DTO;


import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthGoalResponse {

    private Long id;
    private String goalTitle;
    private String description;
    private LocalDate targetDate;
    private boolean achieved;
}