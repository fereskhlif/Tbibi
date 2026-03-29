package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@RestController
@RequestMapping("/medical-records")
@RequiredArgsConstructor
@CrossOrigin("*")
public class MedicalReccordsController {

    private final MedicalRec service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MdicalReccordsResponse add(
            @RequestPart("data") MdicalReccordsRequest request,
            @RequestPart(value = "rep_doc", required = false) MultipartFile file) throws IOException {
        return service.add(request, file);
    }

    @GetMapping
    public List<MdicalReccordsResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public MdicalReccordsResponse getById(@PathVariable int id) {
        return service.getById(id);
    }

//    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public MdicalReccordsResponse update(@PathVariable int id,
//                                         @RequestPart("data") MdicalReccordsRequest request,
//                                         @RequestPart(value = "rep_doc", required = false) MultipartFile file) {
//        return service.update(id, request, file);
//    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }

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

    @GetMapping("/my")
    public ResponseEntity<MdicalReccordsResponse> getMyRecord(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(401).body(null);
            return ResponseEntity.ok(service.getMyRecord(userDetails.getUsername()));
        } catch (Exception e) {
            log.error("Erreur get my record: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping(value = "/my/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MdicalReccordsResponse> uploadPatientImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        try {
            if (userDetails == null) return ResponseEntity.status(401).body(null);
            return ResponseEntity.ok(service.uploadPatientImage(userDetails.getUsername(), file));
        } catch (Exception e) {
            log.error("Erreur upload image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/my")
    public ResponseEntity<MdicalReccordsResponse> updateMyRecord(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MdicalReccordsRequest request) {
        try {
            if (userDetails == null) return ResponseEntity.status(401).body(null);
            return ResponseEntity.ok(service.updateMyRecord(userDetails.getUsername(), request));
        } catch (Exception e) {
            log.error("Erreur update my record: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/my/image")
    public ResponseEntity<?> deleteMyImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("path") String imagePath) {
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