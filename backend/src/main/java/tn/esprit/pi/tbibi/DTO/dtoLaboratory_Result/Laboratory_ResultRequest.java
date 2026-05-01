package tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Laboratory_ResultRequest {

    @NotBlank(message = "Le nom du test est obligatoire")
    @Size(min = 3, max = 200, message = "Le nom du test doit contenir entre 3 et 200 caractères")
    private String testName;

    @NotBlank(message = "La localisation est obligatoire")
    @Size(min = 2, max = 200, message = "La localisation doit contenir entre 2 et 200 caractères")
    private String location;

    @NotBlank(message = "Le nom du laboratoire est obligatoire")
    @Size(min = 2, max = 200, message = "Le nom du laboratoire doit contenir entre 2 et 200 caractères")
    private String nameLabo;

    @Size(max = 1000, message = "La valeur du résultat ne peut pas dépasser 1000 caractères")
    private String resultValue;

    @Pattern(regexp = "^(Draft|Pending|In Progress|Completed|Validated)$", 
             message = "Le statut doit être: Draft, Pending, In Progress, Completed ou Validated")
    private String status;

    @NotNull(message = "La date du test est obligatoire")
    private LocalDate testDate;

    // ID du laborantin
    @NotNull(message = "L'ID du technicien de laboratoire est obligatoire")
    @Positive(message = "L'ID du technicien doit être un nombre positif")
    private Integer laboratoryUserId;

    // ID du patient concerné
    @Positive(message = "L'ID du patient doit être un nombre positif")
    private Integer patientId;

    // ID du médecin qui a prescrit l'analyse
    @Positive(message = "L'ID du médecin doit être un nombre positif")
    private Integer prescribedByDoctorId;
    
    // ✅ Gestion des priorités pour les demandes de tests
    @Pattern(regexp = "^(Normal|Urgent|Critical)$", 
             message = "La priorité doit être: Normal, Urgent ou Critical")
    private String priority; // Normal, Urgent, Critical

    @Size(max = 2000, message = "Les notes de demande ne peuvent pas dépasser 2000 caractères")
    private String requestNotes; // Notes du médecin sur la demande
}
