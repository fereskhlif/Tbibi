package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.entities.User;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedDateDesc(User recipient);
    List<Notification> findByRecipientAndReadFalse(User recipient);
    long countByRecipientAndReadFalse(User recipient);
}