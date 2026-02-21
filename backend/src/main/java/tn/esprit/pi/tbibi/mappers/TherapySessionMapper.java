package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionRequest;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionResponse;
import tn.esprit.pi.tbibi.entities.TherapySession;

@Mapper(componentModel = "spring")
public interface TherapySessionMapper {

    @Mapping(target = "sessionId", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "physiotherapist", ignore = true)
    TherapySession toEntity(TherapySessionRequest request);

    @Mapping(source = "patient.userId", target = "patientId")
    @Mapping(source = "patient.name", target = "patientFullName")
    @Mapping(source = "physiotherapist.userId", target = "physiotherapistId")
    @Mapping(source = "physiotherapist.name", target = "physiotherapistFullName")
    TherapySessionResponse toResponse(TherapySession session);
}