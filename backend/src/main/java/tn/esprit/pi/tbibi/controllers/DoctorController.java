package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.DoctorDTO;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.services.DoctorService;

import java.util.List;

@RestController
@RequestMapping("/api/public/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    /** GET /api/public/doctors/specialties → list of distinct doctor specialties */
    @GetMapping("/specialties")
    public ResponseEntity<List<String>> getAllSpecialties() {
        return ResponseEntity.ok(doctorService.getAllSpecialties());
    }

    /** GET /api/public/doctors?specialty=... OR ?name=... → doctors filtered by specialty or name */
    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getDoctors(
            @RequestParam(value = "specialty", required = false) String specialty,
            @RequestParam(value = "name", required = false) String name) {
        if (name != null && !name.trim().isEmpty()) {
            return ResponseEntity.ok(doctorService.getDoctorsByName(name.trim()));
        }
        if (specialty != null && !specialty.trim().isEmpty()) {
            return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty.trim()));
        }
        return ResponseEntity.ok(java.util.Collections.emptyList());
    }

    /**
     * GET /api/public/doctors/{doctorId}/schedules/available → available schedule
     * slots
     */
    @GetMapping("/{doctorId}/schedules/available")
    public ResponseEntity<List<ScheduleResponse>> getAvailableSchedules(@PathVariable("doctorId") Integer doctorId) {
        return ResponseEntity.ok(doctorService.getAvailableSchedules(doctorId));
    }

    /** GET /api/public/doctors/debug → diagnostic info */
    @GetMapping("/debug")
    public ResponseEntity<List<?>> debugUsers() {
        return ResponseEntity.ok(doctorService.getDebugInfo());
    }
}
