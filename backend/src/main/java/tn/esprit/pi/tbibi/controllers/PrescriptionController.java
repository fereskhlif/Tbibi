package tn.esprit.pi.tbibi.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;
import tn.esprit.pi.tbibi.entities.PrescriptionStatus;
import tn.esprit.pi.tbibi.services.PrescriptionService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PrescriptionController {

    private final PrescriptionService service;

//    @GetMapping("/all")
//    public ResponseEntity<List<PrescriptionResponse>> getAll() {
//        return ResponseEntity.ok(service.getAll());
//    }

//    @GetMapping("/get/{id}")
//    public ResponseEntity<PrescriptionResponse> getById(@PathVariable int id) {
//        try {
//            return ResponseEntity.ok(service.getById(id));
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }

    @PostMapping("/add")
    public ResponseEntity<PrescriptionResponse> add(@RequestBody PrescriptionRequest request) {
        log.info("=== ADD PRESCRIPTION ===");
        log.info("Request reçue: {}", request);
        log.info("Note: {}", request.getNote());
        log.info("Date: {}", request.getDate());
        log.info("Date type: {}", request.getDate() != null ? request.getDate().getClass().getName() : "null");

        try {
            PrescriptionResponse response = service.add(request);
            log.info("Prescription ajoutée avec ID: {}", response.getPrescriptionID());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de l'ajout: {}", e.getMessage(), e);
            throw e;
        }
    }
    @GetMapping("/all")
    public ResponseEntity<String> getAll() throws Exception {
        List<PrescriptionResponse> list = service.getAll();
        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(list);
        System.out.println("JSON LENGTH: " + json.length());
        System.out.println("JSON: " + json);
        return ResponseEntity.ok(json);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<PrescriptionResponse> update(
            @PathVariable int id,
            @RequestBody PrescriptionRequest request) {
        try {
            return ResponseEntity.ok(service.update(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PrescriptionResponse> updateStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {
        try {
            PrescriptionStatus status = PrescriptionStatus.valueOf(body.get("status"));
            return ResponseEntity.ok(service.updateStatus(id, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }



    @PatchMapping("/{id}/assign-acte")
    public ResponseEntity<PrescriptionResponse> assignActe(
            @PathVariable int id,
            @RequestBody Map<String, Integer> body) {
        try {
            return ResponseEntity.ok(service.assignActe(id, body.get("acteId")));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Returns only the prescriptions of the currently authenticated patient,
     * enriched with doctor information. Used by the patient portal.
     */
    @GetMapping("/my")
    public ResponseEntity<List<PrescriptionResponse>> getMyPrescriptions() {
        return ResponseEntity.ok(service.getMyPrescriptions());
    }

    /**
     * Returns prescriptions whose linked Acte has a typeOfActe related to analysis.
     * Used by the laboratory portal.
     */
    @GetMapping("/analysis")
    public ResponseEntity<List<PrescriptionResponse>> getAnalysisPrescriptions() {
        return ResponseEntity.ok(service.getAnalysisPrescriptions());
    }
}