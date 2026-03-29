package tn.esprit.pi.tbibi.Mapper;


import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.HealthGoalDto;
import tn.esprit.pi.tbibi.DTO.HealthGoalProgressDto;
import tn.esprit.pi.tbibi.entities.HealthGoal;
import tn.esprit.pi.tbibi.entities.HealthGoalProgress;

import java.util.stream.Collectors;

@Component
public class HealthGoalMapper {

    public HealthGoalDto toDto(HealthGoal entity) {
        HealthGoalDto dto = new HealthGoalDto();

        dto.setId(entity.getId());
        dto.setGoalTitle(entity.getGoalTitle());
        dto.setGoalDescription(entity.getGoalDescription());
        dto.setGoalType(entity.getGoalType());
        dto.setTargetValue(entity.getTargetValue());
        dto.setUnit(entity.getUnit());
        dto.setFrequencyPerWeek(entity.getFrequencyPerWeek());
        dto.setAchieved(entity.getAchieved());
        dto.setCurrentProgress(entity.getCurrentProgress());
        dto.setCreatedDate(entity.getCreatedDate());
        dto.setTargetDate(entity.getTargetDate());
        dto.setLastUpdatedDate(entity.getLastUpdatedDate());
        dto.setCategory(entity.getCategory());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getUser() != null) {
            dto.setUserId((long) entity.getUser().getUserId());
        }

        // Map progress logs if available
        if (entity.getProgressLogs() != null) {
            dto.setProgressLogs(
                entity.getProgressLogs().stream()
                    .map(this::progressToDto)
                    .collect(Collectors.toList())
            );
        }

        return dto;
    }

    public HealthGoalProgressDto progressToDto(HealthGoalProgress entity) {
        HealthGoalProgressDto dto = new HealthGoalProgressDto();

        dto.setId(entity.getId());
        dto.setLogDate(entity.getLogDate());
        dto.setValue(entity.getValue());
        dto.setCompleted(entity.getCompleted());
        dto.setNotes(entity.getNotes());
        dto.setRecordedAt(entity.getRecordedAt());
        dto.setWeeklyProgress(entity.getWeeklyProgress());

        if (entity.getHealthGoal() != null) {
            dto.setHealthGoalId(entity.getHealthGoal().getId());
        }

        return dto;
    }

    public HealthGoal toEntity(HealthGoalDto dto) {
        HealthGoal entity = new HealthGoal();

        entity.setId(dto.getId());
        entity.setGoalTitle(dto.getGoalTitle());
        entity.setGoalDescription(dto.getGoalDescription());
        entity.setGoalType(dto.getGoalType());
        entity.setTargetValue(dto.getTargetValue());
        entity.setUnit(dto.getUnit());
        entity.setFrequencyPerWeek(dto.getFrequencyPerWeek());
        entity.setAchieved(dto.getAchieved());
        entity.setCurrentProgress(dto.getCurrentProgress());
        entity.setCreatedDate(dto.getCreatedDate());
        entity.setTargetDate(dto.getTargetDate());
        entity.setCategory(dto.getCategory());

        return entity;
    }

    public HealthGoalProgress progressToEntity(HealthGoalProgressDto dto) {
        HealthGoalProgress entity = new HealthGoalProgress();

        entity.setId(dto.getId());
        entity.setLogDate(dto.getLogDate());
        entity.setValue(dto.getValue());
        entity.setCompleted(dto.getCompleted());
        entity.setNotes(dto.getNotes());
        entity.setWeeklyProgress(dto.getWeeklyProgress());

        return entity;
    }
}

