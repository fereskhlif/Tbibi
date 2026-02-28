package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.notification.NotificationResponse;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.mappers.ForumNotificationMapper;
import tn.esprit.pi.tbibi.repositories.NotificationRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class ForumNotificationService implements IForumNotificationService {

    NotificationRepository notificationRepo;
    ForumNotificationMapper notificationMapper;

    @Override
    public List<NotificationResponse> getMyNotifications(Integer userId) {  // ← Long to Integer
        return notificationRepo
                .findByRecipient_UserIdOrderByCreatedAtDesc(Long.valueOf(userId))
                .stream()
                .map(notificationMapper::toDto)
                .toList();
    }

    @Override
    public Long countUnread(Integer userId) {
        return notificationRepo.countByRecipient_UserIdAndIsReadFalse(Long.valueOf(userId));  // ← real count
    }
    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepo.findById(notificationId).orElseThrow();
        notification.setIsRead(true);
        notificationRepo.save(notification);
    }

    @Override
    public void deleteNotification(Long notificationId) {

    }

}