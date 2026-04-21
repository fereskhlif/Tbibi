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
public class AiPredictResponse {
    // Prédiction principale
    private String classe_recommandee;
    private Double confiance;
    private List<Object> top3_classes;

    // Prédiction 2 : Molécule
    private String molecule_recommandee;
    private Double confiance_molecule;

    // Score de risque patient
    private Integer risque_score;
    private String risque_niveau;
    private List<String> risque_alertes;

    // Interactions médicamenteuses
    private List<String> interactions;
    private Boolean has_interactions;

    // Meta
    private Object patient_analyse;
    private String message;
    private String error;
}
