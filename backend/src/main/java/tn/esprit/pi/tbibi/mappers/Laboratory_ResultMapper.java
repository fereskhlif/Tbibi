package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultRequest;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultResponse;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;

@Mapper(componentModel = "spring")
public interface Laboratory_ResultMapper {

    @Mapping(target = "labId", ignore = true)
    @Mapping(target = "medicalPictureAnalysis", ignore = true)
    @Mapping(target = "users", ignore = true)
    Laboratory_Result toEntity(Laboratory_ResultRequest request);

    @Mapping(source = "patient.userId", target = "patientId")
    @Mapping(source = "patient.name", target = "patientFullName")
    Laboratory_ResultResponse toResponse(Laboratory_Result lab);
}