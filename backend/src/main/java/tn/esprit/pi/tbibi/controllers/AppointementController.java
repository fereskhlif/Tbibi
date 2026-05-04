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

    /**
     * Validate an OTP code without creating an appointment.
     * Used by the Physio and Lab booking flows: validates the code first,
     * then the frontend calls /physio-booking or /lab-booking separately.
     */
    @PostMapping("/validate-code")
    public ResponseEntity<Map<String, Object>> validateCode(@RequestBody VerifyConfirmRequest request) {
        boolean valid = appointementService.validateCode(request.getVerificationId(), request.getCode());
        if (valid) {
            return ResponseEntity.ok(Map.of("valid", true));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("valid", false, "message", "Code invalide ou expiré."));
        }
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

    /** Patient accepts the rescheduled time proposed by the doctor */
    @PatchMapping("/{id}/accept-reschedule")
    public ResponseEntity<AppointmentResponse> acceptReschedule(@PathVariable Long id) {
        return ResponseEntity.ok(appointementService.acceptReschedule(id));
    }

    /** Patient rejects the rescheduled time (will choose a new slot or cancel) */
    @PatchMapping("/{id}/reject-reschedule")
    public ResponseEntity<AppointmentResponse> rejectReschedule(@PathVariable Long id) {
        return ResponseEntity.ok(appointementService.rejectReschedule(id));
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

    // ── JPQL Endpoint ─────────────────────────────────────────────────────────────
    /**
     * Get specialty breakdown for a doctor using the JPQL JOIN query
     */
    @GetMapping("/doctor/{doctorId}/specialty-stats")
    public ResponseEntity<List<Map<String, Object>>> getSpecialtyStats(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(appointementService.getSpecialtyStats(doctorId));
    }

    // ── Keyword Query Endpoint ────────────────────────────────────────────────────
    /**
     * Get filtered appointments for a doctor by date range and status using complex keyword query
     */
    @GetMapping("/doctor/{doctorId}/filtered")
    public ResponseEntity<List<AppointmentResponse>> getFilteredAppointments(
            @PathVariable Integer doctorId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate from,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate to,
            @RequestParam StatusAppointement status) {
        return ResponseEntity.ok(appointementService.getFilteredAppointments(doctorId, from, to, status));
    }

    // ── Physiotherapist & Laboratory Public Endpoints ─────────────────────────────

    /** Returns all physiotherapist users */
    @GetMapping("/api/public/physiotherapists")
    public ResponseEntity<List<tn.esprit.pi.tbibi.DTO.DoctorDTO>> getPhysiotherapists() {
        return ResponseEntity.ok(appointementService.getAllPhysiotherapists());
    }

    /** Returns all laboratory users */
    @GetMapping("/api/public/laboratories")
    public ResponseEntity<List<tn.esprit.pi.tbibi.DTO.DoctorDTO>> getLaboratories() {
        return ResponseEntity.ok(appointementService.getAllLaboratories());
    }

    /** Book a physiotherapy session (no schedule slot) */
    @PostMapping("/physio-booking")
    public ResponseEntity<AppointmentResponse> bookPhysio(
            @RequestBody tn.esprit.pi.tbibi.DTO.PhysioBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointementService.createPhysioBooking(request));
    }

    /** Book a laboratory analysis (no schedule slot) */
    @PostMapping("/lab-booking")
    public ResponseEntity<AppointmentResponse> bookLab(
            @RequestBody tn.esprit.pi.tbibi.DTO.LabBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointementService.createLabBooking(request));
    }
}
