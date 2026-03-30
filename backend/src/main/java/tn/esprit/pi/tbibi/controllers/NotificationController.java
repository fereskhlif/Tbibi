package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.repositories.NotificationRepo;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*")
public class NotificationController {

    private final NotificationRepo notificationRepo;

    // Récupérer toutes les notifications d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable Integer userId) {
        try {
            List<Notification> notifications = notificationRepo.findByRecipient_UserIdOrderByCreatedDateDesc(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error fetching notifications for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of error
            return ResponseEntity.ok(List.of());
        }
    }

    // Récupérer les notifications non lues d'un utilisateur
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<?> getUnreadNotifications(@PathVariable Integer userId) {
        try {
            List<Notification> notifications = notificationRepo.findByRecipient_UserIdAndReadFalseOrderByCreatedDateDesc(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error fetching unread notifications for user " + userId + ": " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    // Compter les notifications non lues
    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Integer userId) {
        try {
            long count = notificationRepo.countByRecipient_UserIdAndReadFalse(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            System.err.println("Error counting unread notifications for user " + userId + ": " + e.getMessage());
            return ResponseEntity.ok(0L);
        }
    }

    // Marquer une notification comme lue
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long notificationId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return ResponseEntity.ok(notificationRepo.save(notification));
    }

    // Marquer toutes les notifications d'un utilisateur comme lues
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<String> markAllAsRead(@PathVariable Integer userId) {
        List<Notification> notifications = notificationRepo.findByRecipient_UserIdAndReadFalseOrderByCreatedDateDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(notifications);
        return ResponseEntity.ok("All notifications marked as read");
    }

    // Supprimer une notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotification(@PathVariable Long notificationId) {
        notificationRepo.deleteById(notificationId);
        return ResponseEntity.ok("Notification deleted");
    }
}
