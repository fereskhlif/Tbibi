package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.DoctorDTO;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.services.DoctorService;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/specialties")
    public ResponseEntity<List<String>> getAllSpecialties() {
        return ResponseEntity.ok(doctorService.getAllSpecialties());
    }

    @GetMapping("/by-specialty")
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialty(@RequestParam String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    @GetMapping("/search")
    public ResponseEntity<List<DoctorDTO>> searchDoctorsByName(@RequestParam String name) {
        return ResponseEntity.ok(doctorService.getDoctorsByName(name));
    }

    @GetMapping("/{doctorId}/schedules")
    public ResponseEntity<List<ScheduleResponse>> getAvailableSchedules(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(doctorService.getAvailableSchedules(doctorId));
    }

    @GetMapping("/debug")
    public ResponseEntity<List<?>> getDebugInfo() {
        return ResponseEntity.ok(doctorService.getDebugInfo());
    }
}
