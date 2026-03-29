package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan.TreatmentPlanRequest;
import tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan.TreatmentPlanResponse;
import tn.esprit.pi.tbibi.services.TreatmentPlanService.ITreatmentPlanService;

import java.util.List;

@RestController
@RequestMapping("/api/treatment-plan")
@AllArgsConstructor
public class TreatmentPlanController {

    private final ITreatmentPlanService service;

    @GetMapping
    public List<TreatmentPlanResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public TreatmentPlanResponse getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<TreatmentPlanResponse> getByPatient(@PathVariable Integer patientId) {
        return service.getByPatient(patientId);
    }

    @GetMapping("/physiotherapist/{physiotherapistId}")
    public List<TreatmentPlanResponse> getByPhysiotherapist(@PathVariable Integer physiotherapistId) {
        return service.getByPhysiotherapist(physiotherapistId);
    }

    @GetMapping("/physiotherapist/{physiotherapistId}/status/{status}")
    public List<TreatmentPlanResponse> getByPhysiotherapistAndStatus(
            @PathVariable Integer physiotherapistId,
            @PathVariable String status) {
        return service.getByPhysiotherapistAndStatus(physiotherapistId, status);
    }

    @PostMapping
    public TreatmentPlanResponse create(@RequestBody TreatmentPlanRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public TreatmentPlanResponse update(@PathVariable Integer id, @RequestBody TreatmentPlanRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{id}/status")
    public TreatmentPlanResponse updateStatus(@PathVariable Integer id, @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id) {
        service.delete(id);
        return "Treatment plan with id " + id + " was deleted successfully";
    }
}
