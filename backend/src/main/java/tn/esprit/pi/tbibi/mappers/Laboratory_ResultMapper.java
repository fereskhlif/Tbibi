package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.*;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultRequest;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultResponse;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;

@Mapper(componentModel = "spring")
public interface Laboratory_ResultMapper {

    // ✅ Entity → Response
    @Mapping(source = "laboratoryUser.userId", target = "laboratoryUserId")
    @Mapping(source = "laboratoryUser.name", target = "laboratoryUserName")
    @Mapping(source = "patient.userId", target = "patientId")
    @Mapping(source = "patient.name", target = "patientName")
    @Mapping(source = "prescribedByDoctor.userId", target = "prescribedByDoctorId")
    @Mapping(source = "prescribedByDoctor.name", target = "prescribedByDoctorName")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "scheduledNotifSent", target = "scheduledNotifSent")
    @Mapping(source = "priority", target = "priority")
    @Mapping(source = "requestedAt", target = "requestedAt")
    @Mapping(source = "requestNotes", target = "requestNotes")
    Laboratory_ResultResponse toResponse(Laboratory_Result lab);

    // ✅ Request → Entity
    @Mapping(target = "laboratoryUser", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "prescribedByDoctor", ignore = true)
    @Mapping(target = "labId", ignore = true)
    @Mapping(target = "notificationMessage", ignore = true)
    @Mapping(target = "notificationSent", ignore = true)
    @Mapping(target = "notificationDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)               // ✅ NOUVEAU — géré dans le service
    @Mapping(target = "scheduledNotifSent", ignore = true)      // ✅ NOUVEAU — géré dans le service
    @Mapping(target = "medicalPictureAnalysis", ignore = true)
    Laboratory_Result toEntity(Laboratory_ResultRequest request);
}
