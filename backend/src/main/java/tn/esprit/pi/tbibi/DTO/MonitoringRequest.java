package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringRequest {

    private String diseaseName;
    private LocalDate diagnosisDate;
}
