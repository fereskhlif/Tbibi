package tn.esprit.pi.tbibi.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.entities.HealthGoal;
import tn.esprit.pi.tbibi.entities.HealthGoalProgress;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.HealthGoalRepo;
import tn.esprit.pi.tbibi.repositories.HealthGoalProgressRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class HealthGoalServiceImpl implements IHealthGoalService {

    @Autowired
    private HealthGoalRepo goalRepo;

    @Autowired
    private HealthGoalProgressRepo progressRepo;

    @Autowired
    private UserRepo userRepo;

    @Override
    public HealthGoal createHealthGoal(HealthGoal goal) {
        if (goal.getUser() != null && goal.getUser().getUserId() > 0) {
            User user = userRepo.findById((long) goal.getUser().getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            goal.setUser(user);
        }

        goal.setCreatedAt(LocalDateTime.now());
        goal.setUpdatedAt(LocalDateTime.now());
        goal.setCurrentProgress(goal.getGoalType().name().equals("NUMERIC") ? 0.0 : null);
        goal.setAchieved(false);

        return goalRepo.save(goal);
    }

    @Override
    public HealthGoal updateHealthGoal(Long id, HealthGoal updatedGoal) {
        HealthGoal goal = goalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (updatedGoal.getGoalTitle() != null) {
            goal.setGoalTitle(updatedGoal.getGoalTitle());
        }
        if (updatedGoal.getGoalDescription() != null) {
            goal.setGoalDescription(updatedGoal.getGoalDescription());
        }
        if (updatedGoal.getTargetValue() != null) {
            goal.setTargetValue(updatedGoal.getTargetValue());
        }
        if (updatedGoal.getTargetDate() != null) {
            goal.setTargetDate(updatedGoal.getTargetDate());
        }
        if (updatedGoal.getFrequencyPerWeek() != null) {
            goal.setFrequencyPerWeek(updatedGoal.getFrequencyPerWeek());
        }

        goal.setUpdatedAt(LocalDateTime.now());
        return goalRepo.save(goal);
    }

    @Override
    public List<HealthGoal> getGoalsByUser(Long userId) {
        return goalRepo.findByUserUserId(userId);
    }

    @Override
    public HealthGoal getGoalById(Long id) {
        return goalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
    }

    @Override
    public void deleteGoal(Long id) {
        goalRepo.deleteById(id);
    }

    // Progress tracking
    @Override
    public HealthGoalProgress logProgress(Long goalId, HealthGoalProgress progress) {
        HealthGoal goal = getGoalById(goalId);

        progress.setHealthGoal(goal);
        progress.setRecordedAt(LocalDateTime.now());

        // Update goal's current progress for numeric goals
        if (goal.getGoalType().name().equals("NUMERIC") && progress.getValue() != null) {
            goal.setCurrentProgress(progress.getValue());
            goal.setLastUpdatedDate(LocalDate.now());
            goalRepo.save(goal);
        }

        return progressRepo.save(progress);
    }

    @Override
    public List<HealthGoalProgress> getProgressByGoal(Long goalId) {
        return progressRepo.findByHealthGoalId(goalId);
    }

    @Override
    public List<HealthGoalProgress> getProgressByGoalAndDateRange(Long goalId, LocalDate startDate, LocalDate endDate) {
        return progressRepo.findByHealthGoalIdAndLogDateBetween(goalId, startDate, endDate);
    }

    @Override
    public HealthGoalProgress getProgressByGoalAndDate(Long goalId, LocalDate date) {
        List<HealthGoalProgress> records = progressRepo.findByHealthGoalIdAndLogDate(goalId, date);
        return records.isEmpty() ? null : records.get(0);
    }

    @Override
    public void deleteProgress(Long progressId) {
        progressRepo.deleteById(progressId);
    }

    @Override
    public Double calculateWeeklyProgress(Long goalId) {
        HealthGoal goal = getGoalById(goalId);
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate weekEnd = weekStart.plusDays(6);

        List<HealthGoalProgress> weeklyLogs = getProgressByGoalAndDateRange(goalId, weekStart, weekEnd);

        if (goal.getGoalType().name().equals("NUMERIC")) {
            return weeklyLogs.stream()
                    .mapToDouble(p -> p.getValue() != null ? p.getValue() : 0)
                    .sum();
        } else if (goal.getGoalType().name().equals("HABIT_BASED")) {
            long completedDays = weeklyLogs.stream()
                    .filter(p -> p.getCompleted() != null && p.getCompleted())
                    .count();
            return (double) completedDays;
        }

        return 0.0;
    }

    @Override
    public Boolean checkIfGoalAchieved(Long goalId) {
        HealthGoal goal = getGoalById(goalId);

        if (goal.getGoalType().name().equals("NUMERIC")) {
            return goal.getCurrentProgress() != null && 
                   goal.getCurrentProgress() >= goal.getTargetValue();
        } else if (goal.getGoalType().name().equals("HABIT_BASED")) {
            Double weeklyProgress = calculateWeeklyProgress(goalId);
            return weeklyProgress >= goal.getFrequencyPerWeek();
        }

        return false;
    }
}