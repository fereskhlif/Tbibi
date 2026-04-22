package tn.esprit.pi.tbibi.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.ScheduleRequest;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.DTO.WorkScheduleRequest;
import tn.esprit.pi.tbibi.services.ScheduleService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctor/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    // ─── Generate year-round slots from work template ────────────────────────────

    /**
     * Generate slots for the rest of the current year based on a work template.
     * Respects rest days, recurring daily blocks, and existing date-specific exceptions.
     */
    @PostMapping("/generate")
    public ResponseEntity<List<ScheduleResponse>> generateSlots(
            @RequestBody WorkScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(scheduleService.generateYearSlots(request));
    }

    /**
     * Delete all unbooked (available) slots for a doctor.
     * Used before re-generating the schedule.
     */
    @DeleteMapping("/doctor/{doctorId}/available")
    public ResponseEntity<Void> clearAvailableSlots(@PathVariable Integer doctorId) {
        scheduleService.clearAvailableSlots(doctorId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete all unbooked (available) slots for a doctor on a specific date.
     */
    @DeleteMapping("/doctor/{doctorId}/available/date/{date}")
    public ResponseEntity<Void> clearAvailableSlotsByDate(
            @PathVariable Integer doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        scheduleService.clearAvailableSlotsByDate(doctorId, date);
        return ResponseEntity.noContent().build();
    }

    // ─── Existing CRUD endpoints ─────────────────────────────────────────────────

    /** Create a single schedule slot */
    @PostMapping
    public ResponseEntity<ScheduleResponse> create(@Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.create(request));
    }

    /** Get all schedule slots */
    @GetMapping
    public ResponseEntity<List<ScheduleResponse>> getAll() {
        return ResponseEntity.ok(scheduleService.getAll());
    }

    /** Get one schedule by ID */
    @GetMapping("/{id}")
    public ResponseEntity<ScheduleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getById(id));
    }

    /** Get all schedules for a specific doctor */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ScheduleResponse>> getByDoctorId(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(scheduleService.getByDoctorId(doctorId));
    }

    /** Get available (unbooked) slots for a doctor, optionally filtered by date */
    @GetMapping("/doctor/{doctorId}/available")
    public ResponseEntity<List<ScheduleResponse>> getAvailableByDoctor(
            @PathVariable Integer doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(scheduleService.getByDoctorIdAndDate(doctorId, date));
        }
        return ResponseEntity.ok(scheduleService.getAvailableByDoctorId(doctorId));
    }

    /** Update a schedule slot (DOCTOR only) */
    @PutMapping("/{id}")
    public ResponseEntity<ScheduleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(scheduleService.update(id, request));
    }

    /** Delete a schedule slot (DOCTOR only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
