package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineRequest;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineResponse;
import tn.esprit.pi.tbibi.entities.Medicine;
import tn.esprit.pi.tbibi.mappers.MedicineMapper;
import tn.esprit.pi.tbibi.repositories.MedicineRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class MedicineService implements IMedicineService {

    MedicineRepository medicineRepo;

    @Override
    public MedicineResponse createMedicine(MedicineRequest request) {
        Medicine medicine = MedicineMapper.toEntity(request);
        return MedicineMapper.toResponse(medicineRepo.save(medicine));
    }

    @Override
    public MedicineResponse getMedicineById(Long id) {
        return MedicineMapper.toResponse(medicineRepo.findById(id).orElseThrow());
    }

    @Override
    public List<MedicineResponse> getAllMedicines() {
        return medicineRepo.findAll().stream().map(MedicineMapper::toResponse).toList();
    }

    @Override
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepo.findById(id).orElseThrow();
        medicine.setMedicineName(request.getMedicineName());
        medicine.setQuantity(request.getQuantity());
        medicine.setDateOfExpiration(request.getDateOfExpiration());
        medicine.setPrice(request.getPrice());
        medicine.setStock(request.getStock());
        return MedicineMapper.toResponse(medicineRepo.save(medicine));
    }

    @Override
    public void deleteMedicine(Long id) {
        medicineRepo.deleteById(id);
    }
}