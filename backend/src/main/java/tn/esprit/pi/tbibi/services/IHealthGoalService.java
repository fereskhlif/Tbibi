package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.entities.HealthGoal;
import tn.esprit.pi.tbibi.entities.HealthGoalProgress;

import java.time.LocalDate;
import java.util.List;

public interface IHealthGoalService {

    HealthGoal createHealthGoal(HealthGoal goal);

    HealthGoal updateHealthGoal(Long id, HealthGoal goal);

    List<HealthGoal> getGoalsByUser(Long userId);

    HealthGoal getGoalById(Long id);

    void deleteGoal(Long id);

    // Progress tracking
    HealthGoalProgress logProgress(Long goalId, HealthGoalProgress progress);

    List<HealthGoalProgress> getProgressByGoal(Long goalId);

    List<HealthGoalProgress> getProgressByGoalAndDateRange(Long goalId, LocalDate startDate, LocalDate endDate);

    HealthGoalProgress getProgressByGoalAndDate(Long goalId, LocalDate date);

    void deleteProgress(Long progressId);

    Double calculateWeeklyProgress(Long goalId);

    Boolean checkIfGoalAchieved(Long goalId);
}