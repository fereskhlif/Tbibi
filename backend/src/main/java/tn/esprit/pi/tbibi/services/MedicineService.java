package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineRequest;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineResponse;
import tn.esprit.pi.tbibi.mappers.MedicineMapper;
import tn.esprit.pi.tbibi.entities.Medicine;
import tn.esprit.pi.tbibi.repositories.MedicineRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class MedicineService implements IMedicineService {

    MedicineRepository medicineRepo;
    MedicineMapper medicineMapper;

    @Override
    public MedicineResponse createMedicine(MedicineRequest request) {
        return medicineMapper.toDto(medicineRepo.save(medicineMapper.toEntity(request)));
    }

    @Override
    public MedicineResponse getMedicineById(Long id) {
        return medicineMapper.toDto(medicineRepo.findById(id).orElseThrow());
    }

    @Override
    public List<MedicineResponse> getAllMedicines() {
        return medicineRepo.findAll().stream().map(medicineMapper::toDto).toList();
    }

    @Override
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepo.findById(id).orElseThrow();
        medicine.setMedicineName(request.getMedicineName());
        medicine.setQuantity(request.getQuantity());
        medicine.setDateOfExpiration(request.getDateOfExpiration());
        medicine.setPrice(request.getPrice());
        medicine.setStock(request.getStock());
        return medicineMapper.toDto(medicineRepo.save(medicine));
    }

    @Override
    public void deleteMedicine(Long id) {
        medicineRepo.deleteById(id);
    }
}