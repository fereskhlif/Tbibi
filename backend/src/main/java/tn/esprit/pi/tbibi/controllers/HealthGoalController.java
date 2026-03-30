package tn.esprit.pi.tbibi.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.HealthGoalDto;
import tn.esprit.pi.tbibi.DTO.HealthGoalProgressDto;
import tn.esprit.pi.tbibi.Mapper.HealthGoalMapper;
import tn.esprit.pi.tbibi.entities.HealthGoal;
import tn.esprit.pi.tbibi.entities.HealthGoalProgress;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.services.IHealthGoalService;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/health-goals")
public class HealthGoalController {

    @Autowired
    private IHealthGoalService service;

    @Autowired
    private HealthGoalMapper mapper;

    @Autowired
    private UserRepo userRepo;

    // ✅ CREATE GOAL
    @PostMapping
    public HealthGoalDto createGoal(@RequestBody HealthGoalDto dto) {
        HealthGoal goal = mapper.toEntity(dto);

        if (dto.getUserId() != null) {
            User user = userRepo.findById(dto.getUserId().intValue())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            goal.setUser(user);
        }

        HealthGoal saved = service.createHealthGoal(goal);
        return mapper.toDto(saved);
    }

    // ✅ UPDATE GOAL
    @PutMapping("/{id}")
    public HealthGoalDto updateGoal(@PathVariable Long id, @RequestBody HealthGoalDto dto) {
        HealthGoal goal = mapper.toEntity(dto);
        HealthGoal updated = service.updateHealthGoal(id, goal);
        return mapper.toDto(updated);
    }

    // ✅ GET GOAL BY ID
    @GetMapping("/{id}")
    public HealthGoalDto getGoalById(@PathVariable Long id) {
        return mapper.toDto(service.getGoalById(id));
    }

    // ✅ GET GOALS BY USER
    @GetMapping("/user/{userId}")
    public List<HealthGoalDto> getGoalsByUser(@PathVariable Long userId) {
        return service.getGoalsByUser(userId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // ✅ DELETE GOAL
    @DeleteMapping("/{id}")
    public void deleteGoal(@PathVariable Long id) {
        service.deleteGoal(id);
    }

    // ============= PROGRESS TRACKING =============

    // ✅ LOG PROGRESS
    @PostMapping("/{goalId}/progress")
    public HealthGoalProgressDto logProgress(@PathVariable Long goalId, 
                                             @RequestBody HealthGoalProgressDto dto) {
        HealthGoalProgress progress = mapper.progressToEntity(dto);
        HealthGoalProgress saved = service.logProgress(goalId, progress);
        return mapper.progressToDto(saved);
    }

    // ✅ GET PROGRESS BY GOAL
    @GetMapping("/{goalId}/progress")
    public List<HealthGoalProgressDto> getProgressByGoal(@PathVariable Long goalId) {
        return service.getProgressByGoal(goalId)
                .stream()
                .map(mapper::progressToDto)
                .collect(Collectors.toList());
    }

    // ✅ GET PROGRESS BY DATE RANGE
    @GetMapping("/{goalId}/progress/range")
    public List<HealthGoalProgressDto> getProgressByDateRange(
            @PathVariable Long goalId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return service.getProgressByGoalAndDateRange(goalId, startDate, endDate)
                .stream()
                .map(mapper::progressToDto)
                .collect(Collectors.toList());
    }

    // ✅ GET PROGRESS BY SPECIFIC DATE
    @GetMapping("/{goalId}/progress/{date}")
    public HealthGoalProgressDto getProgressByDate(@PathVariable Long goalId, 
                                                   @PathVariable LocalDate date) {
        HealthGoalProgress progress = service.getProgressByGoalAndDate(goalId, date);
        return progress != null ? mapper.progressToDto(progress) : null;
    }

    // ✅ DELETE PROGRESS
    @DeleteMapping("/progress/{progressId}")
    public void deleteProgress(@PathVariable Long progressId) {
        service.deleteProgress(progressId);
    }

    // ============= ANALYTICS =============

    // ✅ CALCULATE WEEKLY PROGRESS
    @GetMapping("/{goalId}/weekly-progress")
    public Double getWeeklyProgress(@PathVariable Long goalId) {
        return service.calculateWeeklyProgress(goalId);
    }

    // ✅ CHECK IF GOAL ACHIEVED
    @GetMapping("/{goalId}/check-achieved")
    public Boolean checkAchieved(@PathVariable Long goalId) {
        return service.checkIfGoalAchieved(goalId);
    }
}
