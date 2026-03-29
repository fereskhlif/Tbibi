package tn.esprit.pi.tbibi.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;
import tn.esprit.pi.tbibi.services.IAppointementService;
import java.util.List;
@RestController
@RequestMapping("/appointement")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AppointementController {
    private final IAppointementService appointementService;


    @PostMapping
    public ResponseEntity<AppointmentResponse> create(
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(appointementService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAll() {
        return ResponseEntity.ok(appointementService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getById(@PathVariable
                                                           Integer id) {
        return ResponseEntity.ok(appointementService.getById(id));
    }

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<AppointmentResponse>> getByScheduleId(
            @PathVariable Long scheduleId) {
        return ResponseEntity.ok(appointementService.getByScheduleId(Math.toIntExact(scheduleId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> update(
            @PathVariable
            Integer id,
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointementService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable
                                           Integer id) {
        appointementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
