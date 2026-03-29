package tn.esprit.pi.tbibi.Mapper;

import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.HealthGoalReminderDto;
import tn.esprit.pi.tbibi.entities.HealthGoalReminder;

@Component
public class HealthGoalReminderMapper {

    public HealthGoalReminderDto toDto(HealthGoalReminder entity) {
        HealthGoalReminderDto dto = new HealthGoalReminderDto();

        dto.setId(entity.getId());
        dto.setReminderTime(entity.getReminderTime());
        dto.setDailyReminder(entity.getDailyReminder());
        dto.setWeekdayOnly(entity.getWeekdayOnly());
        dto.setEnabled(entity.getEnabled());
        dto.setReminderMessage(entity.getReminderMessage());

        if (entity.getHealthGoal() != null) {
            dto.setHealthGoalId(entity.getHealthGoal().getId());
        }

        return dto;
    }

    public HealthGoalReminder toEntity(HealthGoalReminderDto dto) {
        HealthGoalReminder entity = new HealthGoalReminder();

        entity.setId(dto.getId());
        entity.setReminderTime(dto.getReminderTime());
        entity.setDailyReminder(dto.getDailyReminder());
        entity.setWeekdayOnly(dto.getWeekdayOnly());
        entity.setEnabled(dto.getEnabled());
        entity.setReminderMessage(dto.getReminderMessage());

        return entity;
    }
}
