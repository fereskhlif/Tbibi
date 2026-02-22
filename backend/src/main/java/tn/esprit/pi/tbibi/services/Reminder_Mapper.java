package tn.esprit.pi.tbibi.services;

import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.ReminderRequest;
import tn.esprit.pi.tbibi.DTO.ReminderResponse;
import tn.esprit.pi.tbibi.entities.Reminder;

@Component
public interface Reminder_Mapper {


    Reminder toEntity(ReminderRequest request);


    ReminderResponse toResponse(Reminder reminder);
}