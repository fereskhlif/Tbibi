package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;
import tn.esprit.pi.tbibi.services.PrescriptionService;

import java.util.List;

@RequestMapping("/prescriptions")
@RequiredArgsConstructor
@RestController
public class PrescriptionController {
    private final PrescriptionService service;

    @PostMapping("/add")
    public PrescriptionResponse add(@RequestBody PrescriptionRequest prescription) {
        return service.add(prescription);
    }

    @PutMapping("/update/{id}")
    public PrescriptionResponse update(@PathVariable int id, @RequestBody PrescriptionRequest prescription) {
        return service.update(id, prescription);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }

    @GetMapping("/get/{id}")
    public PrescriptionResponse getById(@PathVariable int id) {
        return service.getById(id);
    }

    @GetMapping("/all")
    public List<PrescriptionResponse> getAll() {
        return service.getAll();
    }
}