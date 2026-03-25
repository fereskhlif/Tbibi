package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;  // ← AJOUTER CET IMPORT
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.ActeRequest;
import tn.esprit.pi.tbibi.DTO.HistoryRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import tn.esprit.pi.tbibi.DTO.PatientRecordDTO;
import tn.esprit.pi.tbibi.services.MedicalRec;

import java.io.IOException;
import java.util.List;

@Slf4j  // ← AJOUTER CETTE ANNOTATION
@RestController
@RequestMapping("/medical-records")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MedicalReccordsController {

    private final MedicalRec service;

    @PostMapping("/add")
    public ResponseEntity<MdicalReccordsResponse> add(@RequestBody MdicalReccordsRequest request) {
        log.info("=== ADD MEDICAL RECORD ===");  // ← Maintenant log fonctionne
        log.info("Request reçue: {}", request);
        log.info("imageUrl: {}", request.getImageUrl());

        try {
            MdicalReccordsResponse response = service.add(request);
            log.info("Record ajouté avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de l'ajout: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }
    @GetMapping("/debug")
    public ResponseEntity<String> debug() {
        try {
            List<MdicalReccordsResponse> list = service.getAll();
            com.fasterxml.jackson.databind.ObjectMapper om =
                    new com.fasterxml.jackson.databind.ObjectMapper();
            String json = om.writeValueAsString(list);
            return ResponseEntity.ok(json);
        } catch (Exception e) {
            // This will show the EXACT cause
            return ResponseEntity.status(500).body("ERROR: " + e.getMessage() +
                    " | Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "none"));
        }
    }
    @PostMapping("/{id}/actes")
    public ResponseEntity<MdicalReccordsResponse> addActe(
            @PathVariable int id,
            @RequestBody ActeRequest request) {
        log.info("=== ADD ACTE TO RECORD {} ===", id);
        return ResponseEntity.ok(service.addActe(id, request));
    }
    @GetMapping("/getAll")
    public ResponseEntity<List<MdicalReccordsResponse>> getAll(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("=== GET ALL ===");

        try {
            List<MdicalReccordsResponse> responses = service.getAll();
            log.info("Réponse à envoyer: {}", responses);
            log.info("Type de réponse: {}", responses.getClass().getName());
            log.info("Nombre d'éléments: {}", responses.size());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            log.error("Erreur: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<MdicalReccordsResponse> getById(@PathVariable int id) {
        log.info("=== GET BY ID: {} ===", id);
        try {
            MdicalReccordsResponse response = service.getById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du record {}: {}", id, e.getMessage());
            return ResponseEntity.status(404).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<MdicalReccordsResponse> update(@PathVariable int id, @RequestBody MdicalReccordsRequest request) {
        log.info("=== UPDATE ID: {} ===", id);
        try {
            MdicalReccordsResponse response = service.update(id, request);
            log.info("Record mis à jour avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        log.info("=== DELETE ID: {} ===", id);
        try {
            service.delete(id);
            log.info("Record supprimé avec succès");
            return ResponseEntity.ok("Record deleted successfully");
        } catch (Exception e) {
            log.error("Erreur lors de la suppression: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error deleting record: " + e.getMessage());
        }
    }

    /** GET /medical-records/patients/search?name=... */
    @GetMapping("/patients/search")
    public ResponseEntity<List<PatientRecordDTO>> searchPatients(
            @RequestParam(required = false, defaultValue = "") String name) {
        log.info("=== SEARCH PATIENTS BY NAME: {} ===", name);
        try {
            List<PatientRecordDTO> result = service.searchPatientsByName(name);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Erreur recherche patients: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    /** POST /medical-records/{id}/history */
    @PostMapping("/{id}/history")
    public ResponseEntity<MdicalReccordsResponse> appendHistory(
            @PathVariable int id,
            @RequestBody HistoryRequest historyRequest) {
        log.info("=== APPEND HISTORY TO RECORD: {} ===", id);
        try {
            MdicalReccordsResponse response = service.appendHistory(id, historyRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur ajout historique: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    // ── Patient self-service endpoints ────────────────────────────────────────

    /** GET /medical-records/my — returns the authenticated patient's own medical record */
    @GetMapping("/my")
    public ResponseEntity<MdicalReccordsResponse> getMyRecord(
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("=== GET MY RECORD for user: {} ===", userDetails != null ? userDetails.getUsername() : "null");
        try {
            if (userDetails == null) return ResponseEntity.status(401).body(null);
            MdicalReccordsResponse response = service.getMyRecord(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur get my record: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    /** POST /medical-records/my/upload-image — patient uploads an image from their PC */
    @PostMapping(value = "/my/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MdicalReccordsResponse> uploadPatientImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        log.info("=== UPLOAD PATIENT IMAGE for user: {} ===", userDetails != null ? userDetails.getUsername() : "null");
        try {
            if (userDetails == null) return ResponseEntity.status(401).body(null);
            MdicalReccordsResponse response = service.uploadPatientImage(userDetails.getUsername(), file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur upload image patient: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    /** PUT /medical-records/my — patient updates their own record (history, chronic diseases) */
    @PutMapping("/my")
    public ResponseEntity<MdicalReccordsResponse> updateMyRecord(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MdicalReccordsRequest request) {
        log.info("=== UPDATE MY RECORD for user: {} ===", userDetails != null ? userDetails.getUsername() : "null");
        try {
            if (userDetails == null) return ResponseEntity.status(401).body(null);
            MdicalReccordsResponse response = service.updateMyRecord(userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur update my record: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    /** DELETE /medical-records/my/image — patient removes one image from their record */
    @DeleteMapping("/my/image")
    public ResponseEntity<?> deleteMyImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("path") String imagePath) {
        log.info("=== DELETE MY IMAGE for user: {} ===", userDetails != null ? userDetails.getUsername() : "null");
        try {
            if (userDetails == null) return ResponseEntity.status(401).body(null);
            service.deletePatientImage(userDetails.getUsername(), imagePath);
            return ResponseEntity.ok("Image supprimée avec succès");
        } catch (Exception e) {
            log.error("Erreur suppression image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }
}