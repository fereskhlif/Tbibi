package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
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

    private String testName;
    private String location;
    private String nameLabo;
    private String resultValue;
    private String status;
    private LocalDate testDate;
    
    // ✅ Gestion des priorités pour les demandes de tests
    @Column(name = "priority", columnDefinition = "VARCHAR(50) DEFAULT 'Normal'")
    private String priority = "Normal"; // Normal, Urgent, Critical
    
    @Column(name = "requested_at")
    private LocalDateTime requestedAt; // Date/heure de la demande
    
    @Column(name = "request_notes", columnDefinition = "TEXT")
    private String requestNotes; // Notes du médecin sur la demande

    // ✅ Laborantin qui crée le résultat
    @ManyToOne
    @JoinColumn(name = "laboratory_user_id", nullable = false)
    @ToString.Exclude
    private User laboratoryUser;

    // ✅ Patient qui reçoit le résultat
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = true)
    @ToString.Exclude
    private User patient;

    // ✅ Médecin qui a prescrit l'analyse
    @ManyToOne
    @JoinColumn(name = "prescribed_by_doctor_id", nullable = true)
    @ToString.Exclude
    private User prescribedByDoctor;

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
}
