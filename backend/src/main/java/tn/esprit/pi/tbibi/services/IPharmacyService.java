package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyRequest;
import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyResponse;

import java.util.List;

public interface IPharmacyService {
    PharmacyResponse createPharmacy(PharmacyRequest request);
    PharmacyResponse getPharmacyById(Long id);
    List<PharmacyResponse> getAllPharmacies();
    PharmacyResponse updatePharmacy(Long id, PharmacyRequest request);
    void deletePharmacy(Long id);
}