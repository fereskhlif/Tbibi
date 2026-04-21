package tn.esprit.pi.tbibi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckSubstituteRequest {
    private Long medicineId;
    private String medicineName;
    private String indication;
    private Integer patientId;
    private String famille;
}
