package tn.esprit.pi.tbibi.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.TeleconsultationRequest;
import tn.esprit.pi.tbibi.DTO.TeleconsultationResponse;
import tn.esprit.pi.tbibi.services.ITeleconsultationService;

import java.util.List;

@RestController
@RequestMapping("/api/teleconsultation")
@RequiredArgsConstructor
public class TeleconsultationController {

    private final ITeleconsultationService teleconsultationService;

    /** Create a teleconsultation linked to an appointment */
    @PostMapping
    public ResponseEntity<TeleconsultationResponse> create(
            @Valid @RequestBody TeleconsultationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teleconsultationService.create(request));
    }

    /** Get all teleconsultations */
    @GetMapping
    public ResponseEntity<List<TeleconsultationResponse>> getAll() {
        return ResponseEntity.ok(teleconsultationService.getAll());
    }

    /** Get one teleconsultation by its ID */
    @GetMapping("/{id}")
    public ResponseEntity<TeleconsultationResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(teleconsultationService.getById(id));
    }

    /** Get the teleconsultation linked to a specific appointment */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<TeleconsultationResponse> getByAppointmentId(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(teleconsultationService.getByAppointmentId(appointmentId));
    }

    /** Update notes on a teleconsultation */
    @PutMapping("/{id}")
    public ResponseEntity<TeleconsultationResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody TeleconsultationRequest request) {
        return ResponseEntity.ok(teleconsultationService.update(id, request));
    }

    /** Delete a teleconsultation */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        teleconsultationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
