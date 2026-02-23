package tn.esprit.pi.tbibi.controllers;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.MedicalAlertRequest;
import tn.esprit.pi.tbibi.DTO.MedicalAlertResponse;
import tn.esprit.pi.tbibi.services.IMedicalAlertService;

import java.util.List;


@RestController
@RequestMapping("/medical-alerts")
@RequiredArgsConstructor
public class MedicalAlertController {

    private final IMedicalAlertService service;

    @GetMapping
    public List<MedicalAlertResponse> getAll() {
        return service.getAll();
    }

    @PostMapping
    public MedicalAlertResponse add(
            @RequestBody MedicalAlertRequest request) {

        return service.add(request);
    }

    @PutMapping("/{id}")
    public MedicalAlertResponse update(
            @PathVariable Long id,
            @RequestBody MedicalAlertRequest request) {

        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}