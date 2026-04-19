package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.PatientProgressDTO;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionRequest;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionResponse;
import tn.esprit.pi.tbibi.services.TherapySessionService.ITherapySessionService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/therapy-session")
@AllArgsConstructor
public class TherapySessionController {

    private final ITherapySessionService service;

    @GetMapping
    public List<TherapySessionResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public TherapySessionResponse getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<TherapySessionResponse> getByPatient(@PathVariable Integer patientId) {
        return service.getByPatient(patientId);
    }

    @GetMapping("/physiotherapist/{physiotherapistId}")
    public List<TherapySessionResponse> getByPhysiotherapist(@PathVariable Integer physiotherapistId) {
        return service.getByPhysiotherapist(physiotherapistId);
    }

    @GetMapping("/physiotherapist/{physiotherapistId}/upcoming")
    public List<TherapySessionResponse> getUpcomingSessions(@PathVariable Integer physiotherapistId) {
        return service.getUpcomingSessions(physiotherapistId);
    }

    @GetMapping("/physiotherapist/{physiotherapistId}/patient-progress")
    public List<PatientProgressDTO> getPatientProgress(@PathVariable Integer physiotherapistId) {
        return service.getPatientProgressByPhysiotherapist(physiotherapistId);
    }

    @GetMapping("/physiotherapist/{physiotherapistId}/patient/{patientId}/progress")
    public PatientProgressDTO getPatientProgressDetail(
            @PathVariable Integer physiotherapistId,
            @PathVariable Integer patientId) {
        return service.getPatientProgress(patientId, physiotherapistId);
    }

    @PostMapping
    public TherapySessionResponse create(@RequestBody TherapySessionRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public TherapySessionResponse update(@PathVariable Integer id, @RequestBody TherapySessionRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{id}/start")
    public TherapySessionResponse startSession(@PathVariable Integer id) {
        return service.startSession(id);
    }

    @PutMapping("/{id}/document")
    public TherapySessionResponse documentSession(
            @PathVariable Integer id,
            @RequestParam String exercisesPerformed,
            @RequestParam String sessionNotes) {
        return service.documentSession(id, exercisesPerformed, sessionNotes);
    }

    @PutMapping("/{id}/complete")
    public TherapySessionResponse completeSession(@PathVariable Integer id, @RequestBody TherapySessionRequest request) {
        return service.completeSession(id, request);
    }

    @PutMapping("/{id}/cancel")
    public TherapySessionResponse cancelSession(@PathVariable Integer id) {
        return service.cancelSession(id);
    }

    @PutMapping("/{id}/reschedule")
    public TherapySessionResponse rescheduleSession(
            @PathVariable Integer id,
            @RequestParam LocalDate newDate,
            @RequestParam LocalTime newStartTime,
            @RequestParam LocalTime newEndTime) {
        return service.rescheduleSession(id, newDate, newStartTime, newEndTime);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id) {
        service.delete(id);
        return "TherapySession with id " + id + " was deleted successfully";
    }
}