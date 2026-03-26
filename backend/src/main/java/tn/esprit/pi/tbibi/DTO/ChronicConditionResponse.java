package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChronicConditionResponse {
    private Long id;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String conditionType;
    private Double value;
    private Double value2;
    private String unit;
    private String severity;         // NORMAL | WARNING | CRITICAL
    private String notes;
    private LocalDateTime recordedAt;
    private String displayValue;     // e.g. "120/80 mmHg" or "5.5 mmol/L"
}
