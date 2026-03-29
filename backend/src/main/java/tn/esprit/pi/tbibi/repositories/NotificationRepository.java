package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Notification;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Récupérer toutes les notifications d'un utilisateur
    List<Notification> findByRecipient_UserIdOrderByCreatedDateDesc(Integer userId);
    
    // Récupérer les notifications non lues d'un utilisateur
    List<Notification> findByRecipient_UserIdAndReadFalseOrderByCreatedDateDesc(Integer userId);
    
    // Compter les notifications non lues d'un utilisateur
    long countByRecipient_UserIdAndReadFalse(Integer userId);
}
