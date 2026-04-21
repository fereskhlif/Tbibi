package tn.esprit.pi.tbibi.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAlternativeItem {
    private String nom;

    /**
     * Normalized clinical relevance score — float 0.0 to 1.0.
     * The Python AI engine emits this as "score" (not "score_clinique").
     * The Angular template multiplies by 100 to display as a percentage.
     */
    @JsonProperty("score")
    private double score;

    @JsonProperty("sous_classe")
    private String sousClasse;

    @JsonProperty("classe_principale")
    private String classePrincipale;

    @JsonProperty("famille_match")
    private String familleMatch;

    private String posologie;
    private String duree;
    private String inst;
    private boolean compatible;
    
    @JsonProperty("indications")
    private String indications;
}
