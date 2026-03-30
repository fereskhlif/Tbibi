package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.HealthGoalReminder;

import java.util.List;

public interface HealthGoalReminderRepo extends JpaRepository<HealthGoalReminder, Long> {

    List<HealthGoalReminder> findByHealthGoalId(Long healthGoalId);

    List<HealthGoalReminder> findByEnabledTrue();
}
