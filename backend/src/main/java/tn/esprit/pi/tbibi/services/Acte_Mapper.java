package tn.esprit.pi.tbibi.services;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.ActeRequest;
import tn.esprit.pi.tbibi.DTO.ActeResponse;
import tn.esprit.pi.tbibi.entities.Acte;

@Mapper(componentModel = "spring", uses = {Prescription_Mapper.class})
public interface Acte_Mapper {

    @Mapping(target = "prescriptions", source = "prescriptions")
    ActeResponse toResponse(Acte acte);

    @Mapping(target = "prescriptions", ignore = true)
    @Mapping(target = "medicalFile",    ignore = true)
    //@Mapping(target = "therapySession",ignore = true)
    Acte toEntity(ActeRequest request);
}
