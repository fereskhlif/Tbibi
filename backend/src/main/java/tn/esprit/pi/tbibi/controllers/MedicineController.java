package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineRequest;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineResponse;
import tn.esprit.pi.tbibi.services.IMedicineService;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class MedicineController {

    IMedicineService medicineService;

    @PostMapping
    public MedicineResponse create(@RequestBody MedicineRequest request) {
        return medicineService.createMedicine(request);
    }

    @GetMapping("/{id}")
    public MedicineResponse getById(@PathVariable Long id) {
        return medicineService.getMedicineById(id);
    }

    @GetMapping
    public List<MedicineResponse> getAll() {
        return medicineService.getAllMedicines();
    }

    @PutMapping("/{id}")
    public MedicineResponse update(@PathVariable Long id, @RequestBody MedicineRequest request) {
        return medicineService.updateMedicine(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
    }
}