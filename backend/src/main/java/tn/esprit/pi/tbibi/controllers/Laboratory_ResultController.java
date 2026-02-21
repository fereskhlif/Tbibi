package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultRequest;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultResponse;
import tn.esprit.pi.tbibi.services.Laboratory_ResultService.ILaboratory_ResultService;
import java.util.List;

@RestController
@RequestMapping("/api/laboratory-result")
@AllArgsConstructor
public class Laboratory_ResultController {

    private final ILaboratory_ResultService service;

    @GetMapping
    public List<Laboratory_ResultResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Laboratory_ResultResponse getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<Laboratory_ResultResponse> getByPatient(@PathVariable Integer patientId) {
        return service.getByPatient(patientId);
    }

    @PostMapping
    public Laboratory_ResultResponse create(@RequestBody Laboratory_ResultRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public Laboratory_ResultResponse update(@PathVariable Integer id, @RequestBody Laboratory_ResultRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id) {
        service.delete(id);
        return "Laboratory result with id " + id + " was deleted successfully";
    }
}