package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
        import tn.esprit.pi.tbibi.DTO.ReminderRequest;
import tn.esprit.pi.tbibi.DTO.ReminderResponse;
import tn.esprit.pi.tbibi.services.IReminderService;

import java.util.List;

@RestController
@RequestMapping("/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final IReminderService reminderService;

    @GetMapping
    public List<ReminderResponse> getAll() {
        return reminderService.getAll();
    }

    @PostMapping
    public ReminderResponse add(@RequestBody ReminderRequest request) {
        return reminderService.add(request);
    }

    @PutMapping("/{id}")
    public ReminderResponse update(@PathVariable Long id,
                                   @RequestBody ReminderRequest request) {
        return reminderService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        reminderService.delete(id);
    }
}