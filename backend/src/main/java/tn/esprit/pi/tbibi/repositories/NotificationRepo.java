package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Notification;

import java.util.List;

public interface NotificationRepo extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Integer recipientId);

    List<Notification> findByRecipientUserIdAndIsReadOrderByCreatedAtDesc(Integer recipientId, boolean isRead);

    long countByRecipientUserIdAndIsRead(Integer recipientId, boolean isRead);
}
