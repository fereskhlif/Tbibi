package tn.esprit.pi.tbibi.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAlternativeRequest {
    private String medicament;
    private String indication;
    private String famille;
    private AiPatient patient;
    @JsonProperty("available_medicines")
    private List<String> availableMedicines;
    @JsonProperty("available_molecules")
    private List<String> availableMolecules;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiPatient {
        private String nom;
        private List<String> allergies;
    }
}
