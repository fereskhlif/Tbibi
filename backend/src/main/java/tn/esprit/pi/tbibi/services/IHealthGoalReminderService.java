package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.entities.HealthGoalReminder;
import tn.esprit.pi.tbibi.entities.Notification;

import java.util.List;

public interface IHealthGoalReminderService {

    HealthGoalReminder createReminder(HealthGoalReminder reminder);

    HealthGoalReminder updateReminder(Long id, HealthGoalReminder reminder);

    HealthGoalReminder getReminderById(Long id);

    List<HealthGoalReminder> getRemindersByGoal(Long goalId);

    List<HealthGoalReminder> getActiveReminders();

    void deleteReminder(Long id);

    // Send notifications
    void sendReminderNotification(Long reminderId);

    void sendDailyReminders();

    Notification createNotification(Long userId, String title, String message, String type);

    List<Notification> getUserNotifications(Long userId);

    void markNotificationAsRead(Long notificationId);
}
