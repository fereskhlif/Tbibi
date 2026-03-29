package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.NotificationDTO;
import tn.esprit.pi.tbibi.DTO.notification.NotificationResponse;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.services.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** Get notifications for any user (patient, doctor, etc.) */
    @GetMapping("/user/{userId}")
    public List<NotificationResponse> getForUser(@PathVariable("userId") Integer userId) {
        return notificationService.getForUser(userId);
    }

    /** Count unread notifications for a user */
    @GetMapping("/unread-count/{userId}")
    public long getUnreadCount(@PathVariable("userId") Integer userId) {
        return notificationService.getUnreadCount(userId);
    }

    /** Mark a single notification as read */
    @PutMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable("id") Long id) {
        return notificationService.markAsRead(id);
    }

    /** Mark all notifications as read for a user */
    @PutMapping("/read-all/{userId}")
    public void markAllAsRead(@PathVariable("userId") Integer userId) {
        notificationService.markAllAsRead(userId);
    }

    /** Doctor-specific: Accept appointment from notification */
    @PatchMapping("/{id}/accept")
    @Transactional
    public ResponseEntity<NotificationResponse> acceptAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.acceptAppointment(id));
    }

    /** Doctor-specific: Refuse appointment from notification */
    @PatchMapping("/{id}/refuse")
    @Transactional
    public ResponseEntity<NotificationResponse> refuseAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.refuseAppointment(id));
    }
}