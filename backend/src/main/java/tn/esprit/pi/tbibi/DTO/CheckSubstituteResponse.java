package tn.esprit.pi.tbibi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckSubstituteResponse {
    private boolean available;
    private String statusMessage;
    private AiAlternativeResponse aiAlternatives;
    /** ID of the matched medicine in stock (set when available = true). */
    private Long medicineId;
    /** Name of the matched medicine in stock (set when available = true). */
    private String medicineName;
}
