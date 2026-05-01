package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "laboratory_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Laboratory_Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer labId;

    @NotBlank(message = "Le nom du test est obligatoire")
    @Size(min = 3, max = 200, message = "Le nom du test doit contenir entre 3 et 200 caractères")
    @Column(nullable = false, length = 200)
    private String testName;

    @NotBlank(message = "La localisation est obligatoire")
    @Size(min = 2, max = 200, message = "La localisation doit contenir entre 2 et 200 caractères")
    @Column(nullable = false, length = 200)
    private String location;

    @NotBlank(message = "Le nom du laboratoire est obligatoire")
    @Size(min = 2, max = 200, message = "Le nom du laboratoire doit contenir entre 2 et 200 caractères")
    @Column(nullable = false, length = 200)
    private String nameLabo;

    @Size(max = 1000, message = "La valeur du résultat ne peut pas dépasser 1000 caractères")
    @Column(length = 1000)
    private String resultValue;

    @Pattern(regexp = "^(Draft|Pending|In Progress|Completed|Validated)$", 
             message = "Le statut doit être: Draft, Pending, In Progress, Completed ou Validated")
    @Column(length = 50)
    private String status;

    @NotNull(message = "La date du test est obligatoire")
    @PastOrPresent(message = "La date du test ne peut pas être dans le futur")
    @Column(nullable = false)
    private LocalDate testDate;
    
    // ✅ Gestion des priorités pour les demandes de tests
    @Pattern(regexp = "^(Normal|Urgent|Critical)$", 
             message = "La priorité doit être: Normal, Urgent ou Critical")
    @Column(name = "priority", columnDefinition = "VARCHAR(50) DEFAULT 'Normal'")
    private String priority = "Normal"; // Normal, Urgent, Critical
    
    @Column(name = "requested_at")
    private LocalDateTime requestedAt; // Date/heure de la demande
    
    @Size(max = 2000, message = "Les notes de demande ne peuvent pas dépasser 2000 caractères")
    @Column(name = "request_notes", columnDefinition = "TEXT")
    private String requestNotes; // Notes du médecin sur la demande

    // ✅ Laborantin qui crée le résultat
    @NotNull(message = "Le technicien de laboratoire est obligatoire")
    @ManyToOne
    @JoinColumn(name = "laboratory_user_id", nullable = false)
    @ToString.Exclude
    private User laboratoryUser;

    // ✅ Patient qui reçoit le résultat
    @ManyToOne
    @JoinColumn(name = "patient_user_id", nullable = true)
    @ToString.Exclude
    private User patient;

    // ✅ Médecin qui a prescrit l'analyse
    @ManyToOne
    @JoinColumn(name = "prescribed_by_doctor_id", nullable = true)
    @ToString.Exclude
    private User prescribedByDoctor;

    @Size(max = 500, message = "Le message de notification ne peut pas dépasser 500 caractères")
    @Column(length = 500)
    private String notificationMessage;

    private boolean notificationSent = false;
    private LocalDate notificationDate;

    // ✅ NOUVEAU — pour le Scheduled
    @Column(updatable = false)  // ⚠️ IMPORTANT: Ne jamais modifier après création
    private LocalDateTime createdAt;        // heure exacte de création
    private boolean scheduledNotifSent = false; // éviter double envoi

    @OneToOne(mappedBy = "laboratoryResult", cascade = CascadeType.ALL)
    @ToString.Exclude
    private MedicalPictureAnalysis medicalPictureAnalysis;

    // ✅ Relation avec MedicalReccords
    @ManyToOne
    @JoinColumn(name = "medical_file_id")
    @ToString.Exclude
    private MedicalReccords medicalReccords;
}
