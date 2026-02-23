package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.ForumNotification;
import java.util.List;

@Repository
public interface ForumNotificationRepository extends JpaRepository<ForumNotification, Long> {
    List<ForumNotification> findByRecipient_UserIdOrderByCreatedAtDesc(Long userId);
    Long countByRecipient_UserIdAndIsReadFalse(Long userId);
}