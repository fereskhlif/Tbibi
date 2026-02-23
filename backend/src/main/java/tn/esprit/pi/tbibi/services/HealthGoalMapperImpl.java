package tn.esprit.pi.tbibi.services;

import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.*;
import tn.esprit.pi.tbibi.entities.HealthGoal;

@Component
public class HealthGoalMapperImpl implements HealthGoalMapper {

    @Override
    public HealthGoal toEntity(HealthGoalRequest request) {
        return HealthGoal.builder()
                .goalTitle(request.getGoalTitle())
                .description(request.getDescription())
                .targetDate(request.getTargetDate())
                .achieved(false)
                .build();
    }

    @Override
    public HealthGoalResponse toResponse(HealthGoal entity) {
        return HealthGoalResponse.builder()
                .id(entity.getId())
                .goalTitle(entity.getGoalTitle())
                .description(entity.getDescription())
                .targetDate(entity.getTargetDate())
                .achieved(entity.isAchieved())
                .build();
    }
}