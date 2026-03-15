package tn.esprit.pi.tbibi.entities;

public enum  PrescriptionStatus {
    PENDING,      // En attente de validation
    VALIDATED,    // Validée par le médecin
    DISPENSED,    // Médicaments délivrés
    COMPLETED,    // Traitement terminé
    CANCELLED
}
