package tn.esprit.pi.tbibi.controllers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MedicineResponse create(
            @RequestPart("medicine") @Valid MedicineRequest request,
            @RequestPart(value = "images", required = true) List<MultipartFile> images) {
        return medicineService.createMedicine(request, images);
    }

    @GetMapping("/{id}")
    public MedicineResponse getById(@PathVariable("id") Long id) {
        return medicineService.getMedicineById(id);
    }

    @GetMapping
    public List<MedicineResponse> getAll() {
        return medicineService.getAllMedicines();
    }

    @GetMapping("/paginated")
    public Page<MedicineResponse> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "medicineName,asc") String[] sort) {
        
        // Handle sorting
        Sort.Direction direction = sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort.Order order = new Sort.Order(direction, sort[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));
        
        return medicineService.getAllMedicinesPaginated(pageable);
    }

    @GetMapping("/pharmacy/{pharmacyId}")
    public List<MedicineResponse> getByPharmacy(@PathVariable("pharmacyId") Long pharmacyId) {
        return medicineService.getMedicinesByPharmacy(pharmacyId);
    }

    @GetMapping("/pharmacy/{pharmacyId}/paginated")
    public Page<MedicineResponse> getByPharmacyPaginated(
            @PathVariable("pharmacyId") Long pharmacyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("medicineName").ascending());
        return medicineService.getMedicinesByPharmacyPaginated(pharmacyId, pageable);
    }

    @GetMapping("/search/paginated")
    public Page<MedicineResponse> searchPaginated(
            @RequestParam("name") String name,
            @RequestParam(name = "pharmacyId", required = false) Long pharmacyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "medicineName,asc") String[] sort) {
        
        Sort.Direction direction = sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort.Order order = new Sort.Order(direction, sort[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));
        
        return medicineService.searchMedicinesPaginated(name, pharmacyId, pageable);
    }

    @PutMapping("/{id}")
    public MedicineResponse update(@PathVariable("id") Long id, @RequestBody @Valid MedicineRequest request) {
        return medicineService.updateMedicine(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id) {
        medicineService.deleteMedicine(id);
    }

    @GetMapping("/low-stock")
    public List<MedicineResponse> getLowStock() {
        return medicineService.getLowStockMedicines();
    }

    @GetMapping("/expired")
    public List<MedicineResponse> getExpired() {
        return medicineService.getExpiredMedicines();
    }

    @GetMapping("/search")
    public List<MedicineResponse> search(@RequestParam("name") String name) {
        return medicineService.searchByName(name);
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MedicineResponse addImage(
            @PathVariable("id") Long id,
            @RequestPart("image") MultipartFile image) {
        return medicineService.addImage(id, image);
    }

    @DeleteMapping("/{id}/images")
    public MedicineResponse removeImage(
            @PathVariable("id") Long id,
            @RequestParam("imageUrl") String imageUrl) {
        return medicineService.removeImage(id, imageUrl);
    }
}
