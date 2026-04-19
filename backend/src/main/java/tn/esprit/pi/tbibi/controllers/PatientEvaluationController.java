package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation.PatientEvaluationRequest;
import tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation.PatientEvaluationResponse;
import tn.esprit.pi.tbibi.services.PatientEvaluationService.IPatientEvaluationService;

import java.util.List;

@RestController
@RequestMapping("/api/patient-evaluation")
@AllArgsConstructor
public class PatientEvaluationController {

    private final IPatientEvaluationService service;

    @GetMapping
    public List<PatientEvaluationResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public PatientEvaluationResponse getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<PatientEvaluationResponse> getByPatient(@PathVariable Integer patientId) {
        return service.getByPatient(patientId);
    }

    @GetMapping("/physiotherapist/{physiotherapistId}")
    public List<PatientEvaluationResponse> getByPhysiotherapist(@PathVariable Integer physiotherapistId) {
        return service.getByPhysiotherapist(physiotherapistId);
    }

    @PostMapping
    public PatientEvaluationResponse create(@RequestBody PatientEvaluationRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public PatientEvaluationResponse update(@PathVariable Integer id, @RequestBody PatientEvaluationRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id) {
        service.delete(id);
        return "Patient evaluation with id " + id + " was deleted successfully";
    }
}
