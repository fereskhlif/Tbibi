package tn.esprit.pi.tbibi.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisRequest;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisResponse;
import tn.esprit.pi.tbibi.services.MedicalPictureAnalysisService.IMedicalPictureAnalysisService;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medical-picture-analysis")
@AllArgsConstructor
public class MedicalPictureAnalysisController {

    private final IMedicalPictureAnalysisService service;

    // ==================== CRUD DE BASE ====================

    @GetMapping
    public List<MedicalPictureAnalysisResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public MedicalPictureAnalysisResponse getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PostMapping
    public MedicalPictureAnalysisResponse create(@RequestBody MedicalPictureAnalysisRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public MedicalPictureAnalysisResponse update(
            @PathVariable Integer id,
            @RequestBody MedicalPictureAnalysisRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id) {
        service.delete(id);
        return "MedicalPictureAnalysis with id " + id + " deleted successfully";
    }

    // ==================== ENDPOINTS AVANCÉS ====================

    // ✅ Upload image + analyse IA automatique
    // POST /api/medical-picture-analysis/upload
    // Body: multipart/form-data — image + laboratoryResultId + category + history
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MedicalPictureAnalysisResponse createWithImage(
            @RequestPart("image") MultipartFile imageFile,
            @RequestPart("data") MedicalPictureAnalysisRequest request) throws IOException {
        return service.createWithImage(request, imageFile);
    }

    // ✅ Valider une analyse : PUT /api/medical-picture-analysis/1/validate?doctorNote=...
    @PutMapping("/{id}/validate")
    public MedicalPictureAnalysisResponse validateAnalysis(
            @PathVariable Integer id,
            @RequestParam String doctorNote) {
        return service.validateAnalysis(id, doctorNote);
    }

    // ✅ Filtrer par statut : GET /api/medical-picture-analysis/status/Pending
    @GetMapping("/status/{status}")
    public List<MedicalPictureAnalysisResponse> getByStatus(@PathVariable String status) {
        return service.getByStatus(status);
    }

    // ✅ Filtrer par catégorie : GET /api/medical-picture-analysis/category/Radio
    @GetMapping("/category/{category}")
    public List<MedicalPictureAnalysisResponse> getByCategory(@PathVariable String category) {
        return service.getByCategory(category);
    }
}