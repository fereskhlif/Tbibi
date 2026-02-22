package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.ReminderRequest;
import tn.esprit.pi.tbibi.DTO.ReminderResponse;
import tn.esprit.pi.tbibi.entities.Reminder;
import tn.esprit.pi.tbibi.repositories.ReminderRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReminderService implements IReminderService {

    private final ReminderRepository reminderRepository;
    private final Reminder_Mapper reminderMapper;

    @Override
    public List<ReminderResponse> getAll() {
        return reminderRepository.findAll()
                .stream()
                .map(reminderMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReminderResponse add(ReminderRequest request) {

        Reminder reminder = reminderMapper.toEntity(request);
        Reminder saved = reminderRepository.save(reminder);

        return reminderMapper.toResponse(saved);
    }

    @Override
    public ReminderResponse update(Long id, ReminderRequest request) {

        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        reminder.setHeureRappel(request.getHeureRappel());
        reminder.setFrequence(request.getFrequence());

        Reminder updated = reminderRepository.save(reminder);

        return reminderMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        reminderRepository.deleteById(id);
    }
}