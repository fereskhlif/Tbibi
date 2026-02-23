package tn.esprit.pi.tbibi.services;

import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;
import tn.esprit.pi.tbibi.entities.Prescription;

@Mapper(componentModel = "spring")
public interface Prescription_Mapper {
    Prescription toEntity(PrescriptionRequest request);
    PrescriptionResponse toDto(Prescription entity);

}
