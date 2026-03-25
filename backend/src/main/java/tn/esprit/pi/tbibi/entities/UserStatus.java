package tn.esprit.pi.tbibi.entities;

public enum UserStatus {
    PENDING,    // En attente de validation du diplôme
    ACTIVE,     // Compte validé et actif
    BLOCKED,    // Compte bloqué par l'admin
    REJECTED    // Demande rejetée par l'admin
}
