package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.HealthGoalProgress;

import java.time.LocalDate;
import java.util.List;

public interface HealthGoalProgressRepo extends JpaRepository<HealthGoalProgress, Long> {

    List<HealthGoalProgress> findByHealthGoalId(Long healthGoalId);

    List<HealthGoalProgress> findByHealthGoalIdAndLogDateBetween(Long healthGoalId, LocalDate startDate, LocalDate endDate);

    List<HealthGoalProgress> findByHealthGoalIdAndLogDate(Long healthGoalId, LocalDate logDate);
}
