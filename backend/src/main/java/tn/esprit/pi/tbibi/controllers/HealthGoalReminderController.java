package tn.esprit.pi.tbibi.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.HealthGoalReminderDto;
import tn.esprit.pi.tbibi.DTO.NotificationDTO;
import tn.esprit.pi.tbibi.Mapper.HealthGoalReminderMapper;
import tn.esprit.pi.tbibi.Mapper.NotificationMapper;
import tn.esprit.pi.tbibi.entities.HealthGoalReminder;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.services.IHealthGoalReminderService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/health-goals/reminders")
@CrossOrigin(origins = "http://localhost:4200")
public class HealthGoalReminderController {

    @Autowired
    private IHealthGoalReminderService reminderService;

    @Autowired
    private HealthGoalReminderMapper reminderMapper;

    @Autowired
    private NotificationMapper notificationMapper;

    // Reminder Management
    @PostMapping
    public HealthGoalReminderDto createReminder(@RequestBody HealthGoalReminderDto dto) {
        HealthGoalReminder reminder = reminderMapper.toEntity(dto);
        HealthGoalReminder saved = reminderService.createReminder(reminder);
        return reminderMapper.toDto(saved);
    }

    @PutMapping("/{id}")
    public HealthGoalReminderDto updateReminder(@PathVariable Long id, @RequestBody HealthGoalReminderDto dto) {
        HealthGoalReminder reminder = reminderMapper.toEntity(dto);
        HealthGoalReminder updated = reminderService.updateReminder(id, reminder);
        return reminderMapper.toDto(updated);
    }

    @GetMapping("/{id}")
    public HealthGoalReminderDto getReminderById(@PathVariable Long id) {
        return reminderMapper.toDto(reminderService.getReminderById(id));
    }

    @GetMapping("/goal/{goalId}")
    public List<HealthGoalReminderDto> getRemindersByGoal(@PathVariable Long goalId) {
        return reminderService.getRemindersByGoal(goalId)
                .stream()
                .map(reminderMapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/active")
    public List<HealthGoalReminderDto> getActiveReminders() {
        return reminderService.getActiveReminders()
                .stream()
                .map(reminderMapper::toDto)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    public void deleteReminder(@PathVariable Long id) {
        reminderService.deleteReminder(id);
    }

    // Notification Management
    @GetMapping("/user/{userId}/notifications")
    public List<NotificationDTO> getUserNotifications(@PathVariable Long userId) {
        return reminderService.getUserNotifications(userId)
                .stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @PutMapping("/notifications/{notificationId}/read")
    public void markAsRead(@PathVariable Long notificationId) {
        reminderService.markNotificationAsRead(notificationId);
    }

    @PostMapping("/send/{reminderId}")
    public void sendReminder(@PathVariable Long reminderId) {
        reminderService.sendReminderNotification(reminderId);
    }
}
