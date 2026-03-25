package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.ChronicConditionRequest;
import tn.esprit.pi.tbibi.DTO.ChronicConditionResponse;
import tn.esprit.pi.tbibi.services.ChronicConditionService;

import java.util.List;

@RestController
@RequestMapping("/api/chronic")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChronicConditionController {

    private final ChronicConditionService service;

    /** Create a new reading */
    @PostMapping
    public ResponseEntity<ChronicConditionResponse> create(@RequestBody ChronicConditionRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    /** Update an existing reading */
    @PutMapping("/{id}")
    public ResponseEntity<ChronicConditionResponse> update(@PathVariable Long id,
                                                            @RequestBody ChronicConditionRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    /** Delete a reading */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** All readings for a specific patient */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ChronicConditionResponse>> byPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getByPatient(patientId));
    }

    /** All readings recorded by a doctor */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ChronicConditionResponse>> byDoctor(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(service.getByDoctor(doctorId));
    }

    /** Only CRITICAL readings for a doctor's patients */
    @GetMapping("/doctor/{doctorId}/critical")
    public ResponseEntity<List<ChronicConditionResponse>> critical(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(service.getCriticalByDoctor(doctorId));
    }

    /** Real-time severity check without saving (for live preview in UI) */
    @PostMapping("/check-severity")
    public ResponseEntity<String> checkSeverity(@RequestBody ChronicConditionRequest req) {
        return ResponseEntity.ok(service.computeSeverity(req.getConditionType(), req.getValue(), req.getValue2()));
    }
}
