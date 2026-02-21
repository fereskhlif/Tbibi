package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisRequest;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisResponse;
import tn.esprit.pi.tbibi.entities.MedicalPictureAnalysis;

@Mapper(componentModel = "spring")
public interface MedicalPictureAnalysisMapper {

    @Mapping(target = "picId", ignore = true)
    @Mapping(target = "laboratoryResult", ignore = true)
    MedicalPictureAnalysis toEntity(MedicalPictureAnalysisRequest request);

    @Mapping(source = "laboratoryResult.labId", target = "laboratoryResultId")
    @Mapping(source = "laboratoryResult.testName", target = "testName")
    @Mapping(source = "laboratoryResult.nameLabo", target = "nameLabo")
    MedicalPictureAnalysisResponse toResponse(MedicalPictureAnalysis pic);
}