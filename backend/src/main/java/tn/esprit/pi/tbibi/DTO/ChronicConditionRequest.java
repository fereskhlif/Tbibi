package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChronicConditionRequest {
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String conditionType;
    private Double value;
    private Double value2;
    private String notes;
    private String recordedAt;
}
