package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionRequest;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionResponse;
import tn.esprit.pi.tbibi.services.TherapySessionService.ITherapySessionService;
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

    @PostMapping
    public TherapySessionResponse create(@RequestBody TherapySessionRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public TherapySessionResponse update(@PathVariable Integer id, @RequestBody TherapySessionRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id) {
        service.delete(id);
        return "TherapySession with id " + id + " was deleted successfully";
    }
}