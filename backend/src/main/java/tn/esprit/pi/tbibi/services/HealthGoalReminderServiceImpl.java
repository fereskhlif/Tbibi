package tn.esprit.pi.tbibi.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.entities.HealthGoalReminder;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.repositories.HealthGoalReminderRepo;
import tn.esprit.pi.tbibi.repositories.NotificationRepo;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class HealthGoalReminderServiceImpl implements IHealthGoalReminderService {

    @Autowired
    private HealthGoalReminderRepo reminderRepo;

    @Autowired
    private NotificationRepo notificationRepo;

    @Override
    public HealthGoalReminder createReminder(HealthGoalReminder reminder) {
        reminder.setEnabled(true);
        return reminderRepo.save(reminder);
    }

    @Override
    public HealthGoalReminder updateReminder(Long id, HealthGoalReminder updatedReminder) {
        HealthGoalReminder reminder = reminderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        if (updatedReminder.getReminderTime() != null) {
            reminder.setReminderTime(updatedReminder.getReminderTime());
        }
        if (updatedReminder.getDailyReminder() != null) {
            reminder.setDailyReminder(updatedReminder.getDailyReminder());
        }
        if (updatedReminder.getWeekdayOnly() != null) {
            reminder.setWeekdayOnly(updatedReminder.getWeekdayOnly());
        }
        if (updatedReminder.getEnabled() != null) {
            reminder.setEnabled(updatedReminder.getEnabled());
        }
        if (updatedReminder.getReminderMessage() != null) {
            reminder.setReminderMessage(updatedReminder.getReminderMessage());
        }

        return reminderRepo.save(reminder);
    }

    @Override
    public HealthGoalReminder getReminderById(Long id) {
        return reminderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
    }

    @Override
    public List<HealthGoalReminder> getRemindersByGoal(Long goalId) {
        return reminderRepo.findByHealthGoalId(goalId);
    }

    @Override
    public List<HealthGoalReminder> getActiveReminders() {
        return reminderRepo.findByEnabledTrue();
    }

    @Override
    public void deleteReminder(Long id) {
        reminderRepo.deleteById(id);
    }

    @Override
    public void sendReminderNotification(Long reminderId) {
        HealthGoalReminder reminder = getReminderById(reminderId);
        
        if (reminder.getHealthGoal() != null && reminder.getHealthGoal().getUser() != null) {
            String message = reminder.getReminderMessage() != null 
                ? reminder.getReminderMessage() 
                : "Time to log your progress for: " + reminder.getHealthGoal().getGoalTitle();

            createNotification(
                (long) reminder.getHealthGoal().getUser().getUserId(),
                "Health Goal Reminder",
                message,
                "REMINDER"
            );
        }
    }

    @Override
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void sendDailyReminders() {
        List<HealthGoalReminder> activeReminders = getActiveReminders();
        LocalTime now = LocalTime.now();

        for (HealthGoalReminder reminder : activeReminders) {
            if (reminder.getDailyReminder() && reminder.getReminderTime() != null) {
                // Check if current time matches reminder time (within 1 minute tolerance)
                if (isTimeToRemind(now, reminder.getReminderTime())) {
                    sendReminderNotification(reminder.getId());
                }
            }
        }
    }

    @Override
    public Notification createNotification(Long userId, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedDate(LocalDateTime.now());

        return notificationRepo.save(notification);
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepo.findAll();
    }

    @Override
    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepo.save(notification);
    }

    private boolean isTimeToRemind(LocalTime now, LocalTime reminderTime) {
        // Check if current time is within 1 minute of reminder time
        return now.isAfter(reminderTime.minusMinutes(1)) && now.isBefore(reminderTime.plusMinutes(1));
    }
}
