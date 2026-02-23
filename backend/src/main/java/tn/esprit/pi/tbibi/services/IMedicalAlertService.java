package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.MedicalAlertRequest;
import tn.esprit.pi.tbibi.DTO.MedicalAlertResponse;

import java.util.List;

public interface IMedicalAlertService {
    List<MedicalAlertResponse> getAll();

    MedicalAlertResponse add(MedicalAlertRequest request);

    MedicalAlertResponse update(Long id,
                                MedicalAlertRequest request);

    void delete(Long id);
}

