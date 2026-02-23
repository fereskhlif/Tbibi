package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.forumnotification.ForumNotificationResponse;

import java.util.List;

public interface IForumNotificationService {
    List<ForumNotificationResponse> getMyNotifications(Long userId);
    Long countUnread(Long userId);
    void markAsRead(Long notificationId);
    void deleteNotification(Long notificationId);
}
