package tn.esprit.pi.tbibi.services;
import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import tn.esprit.pi.tbibi.entities.MedicalReccords;
@Mapper(componentModel = "spring")
public interface MedRec_Mapper {
    MedicalReccords toEntity(MdicalReccordsRequest request);
    MdicalReccordsResponse toResponse(MedicalReccords entity);
}