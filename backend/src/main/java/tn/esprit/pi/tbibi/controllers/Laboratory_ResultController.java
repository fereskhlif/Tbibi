package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultRequest;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultResponse;
import tn.esprit.pi.tbibi.services.Laboratory_ResultService.ILaboratory_ResultService;

import java.util.List;

@RestController
@RequestMapping("/api/laboratory-results")
@AllArgsConstructor
@CrossOrigin(originPatterns = "*")  // ✅ originPatterns au lieu de origins
public class Laboratory_ResultController {

    private final ILaboratory_ResultService service;

    @GetMapping
    public ResponseEntity<List<Laboratory_ResultResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Laboratory_ResultResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Laboratory_ResultRequest request) {
        try {
            // ✅ Log the incoming request for debugging
            System.out.println("=".repeat(80));
            System.out.println("📥 RECEIVED CREATE REQUEST");
            System.out.println("Request: " + request);
            System.out.println("laboratoryUserId: " + request.getLaboratoryUserId());
            System.out.println("patientId: " + request.getPatientId());
            System.out.println("prescribedByDoctorId: " + request.getPrescribedByDoctorId());
            System.out.println("testName: " + request.getTestName());
            System.out.println("status: " + request.getStatus());
            System.out.println("=".repeat(80));
            
            Laboratory_ResultResponse response = service.create(request);
            System.out.println("✅ Successfully created laboratory result");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // ✅ Return detailed error message
            System.err.println("=".repeat(80));
            System.err.println("❌ ERROR CREATING LABORATORY RESULT");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            System.err.println("=".repeat(80));
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                java.util.Map.of(
                    "error", "Failed to create laboratory result",
                    "message", e.getMessage() != null ? e.getMessage() : "Unknown error",
                    "type", e.getClass().getSimpleName(),
                    "timestamp", java.time.LocalDateTime.now().toString()
                )
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Laboratory_ResultResponse> update(
            @PathVariable Integer id,
            @RequestBody Laboratory_ResultRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok("Laboratory result with id " + id + " deleted successfully");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Laboratory_ResultResponse>> getByLaboratoryUser(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(service.getByLaboratoryUser(userId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Laboratory_ResultResponse>> getByPatient(
            @PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Laboratory_ResultResponse>> getByPrescribedByDoctor(
            @PathVariable Integer doctorId) {
        return ResponseEntity.ok(service.getByPrescribedByDoctor(doctorId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Laboratory_ResultResponse>> getByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Laboratory_ResultResponse> updateStatus(
            @PathVariable Integer id,
            @RequestParam String newStatus) {
        return ResponseEntity.ok(service.updateStatus(id, newStatus));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Laboratory_ResultResponse>> getByPriority(
            @PathVariable String priority) {
        return ResponseEntity.ok(service.getByPriority(priority));
    }

    @GetMapping("/pending-requests")
    public ResponseEntity<List<Laboratory_ResultResponse>> getPendingRequests() {
        return ResponseEntity.ok(service.getPendingRequests());
    }

    @GetMapping("/urgent-requests")
    public ResponseEntity<List<Laboratory_ResultResponse>> getUrgentRequests() {
        return ResponseEntity.ok(service.getUrgentRequests());
    }

    @GetMapping("/debug")
    public ResponseEntity<String> debug() {
        try {
            List<Laboratory_ResultResponse> results = service.getAll();
            return ResponseEntity.ok("✅ Success! Found " + results.size() + " results");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Error: " + e.getMessage() + "\n" + e.getClass().getName());
        }
    }
}