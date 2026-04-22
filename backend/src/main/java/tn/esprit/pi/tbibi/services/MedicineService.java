package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineRequest;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineResponse;
import tn.esprit.pi.tbibi.entities.Pharmacy;
import tn.esprit.pi.tbibi.mappers.MedicineMapper;
import tn.esprit.pi.tbibi.entities.Medicine;
import tn.esprit.pi.tbibi.repositories.MedicineRepository;
import tn.esprit.pi.tbibi.repositories.PharmacyRepository;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;
import org.springframework.web.client.RestTemplate;

@Service
@AllArgsConstructor
public class MedicineService implements IMedicineService {

    MedicineRepository medicineRepo;
    MedicineMapper medicineMapper;
    CloudinaryService cloudinaryService;
    PharmacyRepository pharmacyRepo;

    @Override
    public MedicineResponse createMedicine(MedicineRequest request, List<MultipartFile> images) {
        Medicine medicine = medicineMapper.toEntity(request);
        medicine.setAvailable(true);

        // ✅ link medicine to pharmacy
        Pharmacy pharmacy = null;
        if (request.getPharmacyId() != null) {
            pharmacy = pharmacyRepo.findById(request.getPharmacyId()).orElse(null);
        }
        if (pharmacy == null) {
            pharmacy = pharmacyRepo.findById(1L).orElse(null);
            if (pharmacy == null) {
                pharmacy = new Pharmacy();
                pharmacy.setPharmacyName("Default Pharmacy");
                pharmacy.setPharmacyAddress("123 Main St");
                pharmacy = pharmacyRepo.save(pharmacy);
            }
        }
        medicine.setPharmacy(pharmacy);

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = cloudinaryService.uploadImages(images);
            medicine.setImageUrls(imageUrls);
        }

        Medicine saved = medicineRepo.save(medicine);
        triggerAiSync();
        return medicineMapper.toDto(saved);
    }

    @Override
    public void triggerAiSync() {
        CompletableFuture.runAsync(() -> {
            try {
                System.out.println("Triggering AI Sync with MySQL Database...");
                RestTemplate restTemplate = new RestTemplate();
                restTemplate.postForEntity("http://localhost:5001/api/sync-database", null, String.class);
                System.out.println("AI Sync completed.");
            } catch (Exception e) {
                System.err.println("Failed to trigger AI sync: " + e.getMessage());
            }
        });
    }

    @Override
    public List<MedicineResponse> getMedicinesByPharmacy(Long pharmacyId) {
        return medicineRepo.findByPharmacy_PharmacyIdAndAvailableTrue(pharmacyId)
                .stream()
                .map(medicineMapper::toDto)
                .toList();
    }

    @Override
    public Page<MedicineResponse> getAllMedicinesPaginated(Pageable pageable) {
        return medicineRepo.findByAvailableTrue(pageable)
                .map(medicineMapper::toDto);
    }

    @Override
    public Page<MedicineResponse> getMedicinesByPharmacyPaginated(Long pharmacyId, Pageable pageable) {
        return medicineRepo.findByPharmacy_PharmacyIdAndAvailableTrue(pharmacyId, pageable)
                .map(medicineMapper::toDto);
    }

    @Override
    public Page<MedicineResponse> searchMedicinesPaginated(String name, Long pharmacyId, Pageable pageable) {
        if (pharmacyId != null) {
            return medicineRepo.findByMedicineNameContainingIgnoreCaseAndPharmacy_PharmacyIdAndAvailableTrue(name, pharmacyId, pageable)
                    .map(medicineMapper::toDto);
        }
        return medicineRepo.findByMedicineNameContainingIgnoreCaseAndAvailableTrue(name, pageable)
                .map(medicineMapper::toDto);
    }

    // add image to existing medicine
    @Override
    public MedicineResponse addImage(Long id, MultipartFile image) {
        Medicine medicine = medicineRepo.findById(id).orElseThrow();
        String imageUrl = cloudinaryService.uploadImage(image);
        medicine.getImageUrls().add(imageUrl);
        return medicineMapper.toDto(medicineRepo.save(medicine));
    }

    // remove image from medicine
    @Override
    public MedicineResponse removeImage(Long id, String imageUrl) {
        Medicine medicine = medicineRepo.findById(id).orElseThrow();
        cloudinaryService.deleteImage(imageUrl);
        medicine.getImageUrls().remove(imageUrl);
        return medicineMapper.toDto(medicineRepo.save(medicine));
    }



    @Override
    public MedicineResponse getMedicineById(Long id) {
        return medicineMapper.toDto(medicineRepo.findById(id).orElseThrow());
    }

    @Override
    public List<MedicineResponse> getAllMedicines() {
        return medicineRepo.findByAvailableTrue()
                .stream()
                .map(medicineMapper::toDto)
                .toList();
    }

    @Override
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepo.findById(id).orElseThrow();
        medicine.setMedicineName(request.getMedicineName());
        medicine.setDateOfExpiration(request.getDateOfExpiration());
        medicine.setPrice(request.getPrice());
        medicine.setStock(request.getStock());
        medicine.setMinStockAlert(request.getMinStockAlert());
        Medicine saved = medicineRepo.save(medicine);
        triggerAiSync();
        return medicineMapper.toDto(saved);
    }

    @Override
    public List<MedicineResponse> getLowStockMedicines() {
        return medicineRepo.findAll()
                .stream()
                .filter(m -> m.getStock() < m.getMinStockAlert())
                .map(medicineMapper::toDto)
                .toList();
    }

    @Override
    public List<MedicineResponse> getExpiredMedicines() {
        return medicineRepo.findByDateOfExpirationBefore(new Date())
                .stream()
                .map(medicineMapper::toDto)
                .toList();
    }

    @Override
    public List<MedicineResponse> searchByName(String name) {
        return medicineRepo.findByMedicineNameContaining(name)
                .stream()
                .map(medicineMapper::toDto)
                .toList();
    }

    @Override
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepo.findById(id).orElseThrow();
        medicine.setAvailable(false); // ← soft delete
        medicineRepo.save(medicine);
    }

    @Override
    public List<String> getAvailableMedicineNames() {
        return medicineRepo.findByStockGreaterThanAndAvailableTrue(0)
                .stream()
                .map(Medicine::getMedicineName)
                .filter(name -> name != null && !name.trim().isEmpty())
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAvailableMoleculesInStock() {
        return medicineRepo.findByStockGreaterThanAndAvailableTrue(0)
                .stream()
                .map(Medicine::getActiveIngredient)
                .filter(mol -> mol != null && !mol.trim().isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }
}