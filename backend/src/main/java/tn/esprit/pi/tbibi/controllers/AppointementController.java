package tn.esprit.pi.tbibi.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;
import tn.esprit.pi.tbibi.DTO.VerificationRequest;
import tn.esprit.pi.tbibi.DTO.VerifyConfirmRequest;
import tn.esprit.pi.tbibi.entities.StatusAppointement;
import tn.esprit.pi.tbibi.services.AppointementService;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/appointement")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AppointementController {

    private final AppointementService appointementService;

    /** Create a new appointment on a specific schedule slot */
    @PostMapping
    public ResponseEntity<AppointmentResponse> create(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointementService.create(request));
    }

    /** Send SMS verification code before confirming appointment */
    @PostMapping("/send-verification")
    public ResponseEntity<Map<String, String>> sendVerification(@RequestBody VerificationRequest request) {
        String verificationId = appointementService.sendVerificationCode(request);
        return ResponseEntity.ok(Map.of("verificationId", verificationId));
    }

    /** Verify SMS code and create appointment, send confirmation email */
    @PostMapping("/verify-and-confirm")
    public ResponseEntity<AppointmentResponse> verifyAndConfirm(@RequestBody VerifyConfirmRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointementService.verifyAndConfirm(request.getVerificationId(), request.getCode()));
    }

    /** Get all appointments */
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAll() {
        return ResponseEntity.ok(appointementService.getAll());
    }

    /** Get one appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(appointementService.getById(id));
    }*/

    /** Get all appointments for a given schedule slot */
    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<AppointmentResponse>> getByScheduleId(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(appointementService.getByScheduleId(scheduleId));
    }

    /** Get all appointments booked by a specific patient */
    @GetMapping("/patient/{userId}")
    public ResponseEntity<List<AppointmentResponse>> getByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(appointementService.getByUserId(userId));
    }

    /** Get all appointments assigned to a specific doctor (by their user ID) */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> getByDoctorId(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(appointementService.getByDoctorId(doctorId));
    }

    /** Reschedule an appointment to a new available schedule slot */
    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponse> reschedule(
            @PathVariable Long id,
            @RequestParam Long newScheduleId) {
        return ResponseEntity.ok(appointementService.reschedule(id, newScheduleId));
    }

    /** Full update of an appointment */
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointementService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam StatusAppointement status) {
        return ResponseEntity.ok(appointementService.updateStatus(id, status));
    }

    /** Delete an appointment */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        appointementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
