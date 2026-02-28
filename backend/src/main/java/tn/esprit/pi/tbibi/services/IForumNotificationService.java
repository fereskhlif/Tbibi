package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.notification.NotificationResponse;

import java.util.List;

public interface IForumNotificationService {
    List<NotificationResponse> getMyNotifications(Integer userId);
    Long countUnread(Integer userId);
    void markAsRead(Long notificationId);
    void deleteNotification(Long notificationId);
}
