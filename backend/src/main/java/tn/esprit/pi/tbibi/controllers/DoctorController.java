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

    /** GET /api/public/doctors?specialty=... → doctors filtered by specialty */
    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialty(@RequestParam("specialty") String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
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
