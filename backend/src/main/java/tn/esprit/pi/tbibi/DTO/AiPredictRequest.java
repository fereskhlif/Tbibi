package tn.esprit.pi.tbibi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictRequest {
    private Integer patientId;
    private Double weight;
    private String indication;
    private List<String> medicamentsActuels;
}
