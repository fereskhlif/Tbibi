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
public class AiAlternativeRequest {
    private String medicament;
    private String indication;
    private String famille;
    private AiPatient patient;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiPatient {
        private String nom;
        private List<String> allergies;
    }
}
