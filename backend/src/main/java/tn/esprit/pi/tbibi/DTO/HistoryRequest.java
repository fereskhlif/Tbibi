package tn.esprit.pi.tbibi.DTO;

import lombok.*;

/**
 * Request body for POST /medical-records/{id}/history
 * Contains all visit details to be appended to medical_historuy.
 */
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryRequest {
    /** Filière sélectionnée: "Récupération des dépenses", "Filière public", "Médecin de famille" */
    private String filiere;

    /** Nom du médecin traitant */
    private String doctorName;

    /** Notes générales de la visite */
    private String visitNote;

    /** Analyse sanguins (résultats / observations) */
    private String analyseSanguine;

    /** Vaccinations effectuées */
    private String vaccination;

    // Nouveaux champs pour la visite
    private java.util.List<String> prescriptions; // ID ou nom de la prescription
    private String autre;
    private java.util.List<VaccineRequest> vaccines;
    private String appareilUrinaire;
    private java.util.List<UrinaryExamRequest> urinaryExams;
}
