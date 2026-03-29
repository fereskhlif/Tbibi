package tn.esprit.pi.tbibi.services;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import tn.esprit.pi.tbibi.entities.MedicalReccords;

@Mapper(componentModel = "spring", uses = {Prescription_Mapper.class, Acte_Mapper.class})
public interface MedRec_Mapper {

    @Mapping(target = "laboratoryResults", ignore = true)
    @Mapping(target = "actes", ignore = true)
    MedicalReccords toEntity(MdicalReccordsRequest request);

    @Mapping(target = "actes", source = "actes")
    MdicalReccordsResponse toResponse(MedicalReccords entity);
}