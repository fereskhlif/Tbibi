package tn.esprit.pi.tbibi.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipient_UserIdOrderByCreatedAtDesc(Long userId);
    Long countByRecipient_UserIdAndIsReadFalse(Long userId);

    //@Transactional
    //void deleteByComment_CommentId(Long commentId);
}