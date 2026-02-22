package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyRequest;
import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyResponse;
import tn.esprit.pi.tbibi.entities.Pharmacy;
import tn.esprit.pi.tbibi.mappers.PharmacyMapper;
import tn.esprit.pi.tbibi.repositories.PharmacyRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class PharmacyService implements IPharmacyService {

    PharmacyRepository pharmacyRepo;

    @Override
    public PharmacyResponse createPharmacy(PharmacyRequest request) {
        Pharmacy pharmacy = PharmacyMapper.toEntity(request);
        return PharmacyMapper.toResponse(pharmacyRepo.save(pharmacy));
    }

    @Override
    public PharmacyResponse getPharmacyById(Long id) {
        return PharmacyMapper.toResponse(pharmacyRepo.findById(id).orElseThrow());
    }

    @Override
    public List<PharmacyResponse> getAllPharmacies() {
        return pharmacyRepo.findAll().stream().map(PharmacyMapper::toResponse).toList();
    }

    @Override
    public PharmacyResponse updatePharmacy(Long id, PharmacyRequest request) {
        Pharmacy pharmacy = pharmacyRepo.findById(id).orElseThrow();
        pharmacy.setPharmacyName(request.getPharmacyName());
        pharmacy.setPharmacyAddress(request.getPharmacyAddress());
        return PharmacyMapper.toResponse(pharmacyRepo.save(pharmacy));
    }

    @Override
    public void deletePharmacy(Long id) {
        pharmacyRepo.deleteById(id);
    }
}