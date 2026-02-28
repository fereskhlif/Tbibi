package tn.esprit.pi.tbibi.services;

import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineRequest;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineResponse;

import java.util.List;

public interface IMedicineService {
    MedicineResponse createMedicine(MedicineRequest request , List<MultipartFile> images);
    MedicineResponse getMedicineById(Long id);
    List<MedicineResponse> getAllMedicines();
    MedicineResponse updateMedicine(Long id, MedicineRequest request);
    void deleteMedicine(Long id);
    List<MedicineResponse> getLowStockMedicines();
    List<MedicineResponse> getExpiredMedicines();
    List<MedicineResponse> searchByName(String name);
    MedicineResponse addImage(Long id, MultipartFile image); // ✅ added
    MedicineResponse removeImage(Long id, String imageUrl);
}
