package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.forumnotification.ForumNotificationResponse;
import tn.esprit.pi.tbibi.mappers.ForumNotificationMapper;
import tn.esprit.pi.tbibi.entities.ForumNotification;
import tn.esprit.pi.tbibi.repositories.ForumNotificationRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class ForumNotificationService implements IForumNotificationService {

    ForumNotificationRepository notificationRepo;
    ForumNotificationMapper notificationMapper;

    @Override
    public List<ForumNotificationResponse> getMyNotifications(Long userId) {
        return notificationRepo
                .findByRecipient_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toDto)
                .toList();
    }

    @Override
    public Long countUnread(Long userId) {
        return notificationRepo.countByRecipient_UserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        ForumNotification notification = notificationRepo.findById(notificationId).orElseThrow();
        notification.setIsRead(true);
        notificationRepo.save(notification);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        notificationRepo.deleteById(notificationId);
    }
}