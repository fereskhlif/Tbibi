package tn.esprit.pi.tbibi.services;


import tn.esprit.pi.tbibi.DTO.MedicalAlertRequest;
import tn.esprit.pi.tbibi.DTO.MedicalAlertResponse;
import tn.esprit.pi.tbibi.entities.MedicalAlert;

public interface MedicalAlertMapper {

    MedicalAlert toEntity(MedicalAlertRequest request);

    MedicalAlertResponse toResponse(MedicalAlert entity);
}
