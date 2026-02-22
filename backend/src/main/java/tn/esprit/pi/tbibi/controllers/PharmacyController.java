package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyRequest;
import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyResponse;
import tn.esprit.pi.tbibi.services.IPharmacyService;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacies")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class PharmacyController {

    IPharmacyService pharmacyService;

    @PostMapping
    public PharmacyResponse create(@RequestBody PharmacyRequest request) {
        return pharmacyService.createPharmacy(request);
    }

    @GetMapping("/{id}")
    public PharmacyResponse getById(@PathVariable Long id) {
        return pharmacyService.getPharmacyById(id);
    }

    @GetMapping
    public List<PharmacyResponse> getAll() {
        return pharmacyService.getAllPharmacies();
    }

    @PutMapping("/{id}")
    public PharmacyResponse update(@PathVariable Long id, @RequestBody PharmacyRequest request) {
        return pharmacyService.updatePharmacy(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        pharmacyService.deletePharmacy(id);
    }
}