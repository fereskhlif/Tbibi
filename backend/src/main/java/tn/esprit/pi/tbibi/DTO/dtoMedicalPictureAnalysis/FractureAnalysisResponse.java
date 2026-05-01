package tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FractureAnalysisResponse {
    private Integer picId;
    private String prediction;              // "fracture" ou "no_fracture"
    private Double confidence;              // 0.0 à 1.0
    private String confidenceLevel;         // "high", "medium", "low"
    private Map<String, Double> probabilities;  // {"fracture": 0.367, "no_fracture": 0.633}
    private String message;                 // Message descriptif
    private String warning;                 // Warning si confiance faible
    private boolean analysisUpdated;        // Indique si l'analyse a été mise à jour en BD
}
