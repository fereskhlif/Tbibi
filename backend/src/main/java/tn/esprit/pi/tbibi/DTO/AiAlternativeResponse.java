package tn.esprit.pi.tbibi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAlternativeResponse {
    private List<AiAlternativeItem> alternatives;
    private List<String> logs;
    private Map<String, Integer> stats;
    private String message;
}
