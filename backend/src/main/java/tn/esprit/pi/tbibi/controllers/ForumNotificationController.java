package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.forumnotification.ForumNotificationResponse;
import tn.esprit.pi.tbibi.services.IForumNotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/forum/notifications")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class ForumNotificationController {

    IForumNotificationService notificationService;

    @GetMapping("/user/{userId}")
    public List<ForumNotificationResponse> getMyNotifications(@PathVariable Long userId) {
        return notificationService.getMyNotifications(userId);
    }

    @GetMapping("/unread/user/{userId}")
    public Long countUnread(@PathVariable Long userId) {
        return notificationService.countUnread(userId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }
}
