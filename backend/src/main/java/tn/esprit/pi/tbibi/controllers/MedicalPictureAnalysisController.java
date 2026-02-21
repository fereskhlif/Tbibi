package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisRequest;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisResponse;
import tn.esprit.pi.tbibi.services.MedicalPictureAnalysisService.IMedicalPictureAnalysisService;
import java.util.List;

@RestController
@RequestMapping("/api/medical-picture-analysis")
@AllArgsConstructor
public class MedicalPictureAnalysisController {

    private final IMedicalPictureAnalysisService service;

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
    public MedicalPictureAnalysisResponse update(@PathVariable Integer id, @RequestBody MedicalPictureAnalysisRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id) {
        service.delete(id);
        return "MedicalPictureAnalysis with id " + id + " was deleted successfully";
    }
}