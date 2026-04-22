package tn.esprit.pi.tbibi.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    /** Serialised as ISO-8601 string so JavaScript's new Date() parses it correctly */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime recordedAt;

    private String displayValue;     // e.g. "120/80 mmHg" or "5.5 mmol/L"
}
