package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.medicine.MedicineRequest;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineResponse;

import java.util.List;

public interface IMedicineService {
    MedicineResponse createMedicine(MedicineRequest request);
    MedicineResponse getMedicineById(Long id);
    List<MedicineResponse> getAllMedicines();
    MedicineResponse updateMedicine(Long id, MedicineRequest request);
    void deleteMedicine(Long id);
}
