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
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
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
}