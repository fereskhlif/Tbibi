package tn.esprit.pi.tbibi.services;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;
import tn.esprit.pi.tbibi.entities.Medicine;
import tn.esprit.pi.tbibi.entities.Prescription;
import tn.esprit.pi.tbibi.entities.PrescriptionStatus;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface Prescription_Mapper {

    @Mapping(target = "acte",            ignore = true)
    @Mapping(target = "medicines",       ignore = true)
    @Mapping(target = "treatments",      ignore = true)
    @Mapping(target = "status",          ignore = true)
    @Mapping(target = "statusUpdatedAt", ignore = true)

    Prescription toEntity(PrescriptionRequest request);

    @Mapping(target = "date",            source = "date",            qualifiedByName = "dateToIso")
    @Mapping(target = "expirationDate",  source = "expirationDate",  qualifiedByName = "dateToIso")
    @Mapping(target = "statusUpdatedAt", source = "statusUpdatedAt", qualifiedByName = "dateToIso")
    @Mapping(target = "status",          source = "status",          qualifiedByName = "safeStatus")
    @Mapping(target = "acteId",          source = "acte.acteId")
    @Mapping(target = "acteType",        source = "acte.typeOfActe")
    @Mapping(target = "patientId",       ignore = true)
    @Mapping(target = "patientName",     ignore = true)
    @Mapping(target = "patientEmail",    ignore = true)
    @Mapping(target = "doctorId",        ignore = true)
    @Mapping(target = "doctorName",      ignore = true)
    @Mapping(target = "medicines",       ignore = true)
    PrescriptionResponse toDto(Prescription entity);

    @Named("dateToIso")
    default String dateToIso(Date date) {
        if (date == null) return null;
        return DateTimeFormatter.ISO_INSTANT
                .format(Instant.ofEpochMilli(date.getTime()).atOffset(ZoneOffset.UTC));
    }

    // Protège contre les status NULL en base (anciennes lignes sans status)
    @Named("safeStatus")
    default PrescriptionStatus safeStatus(PrescriptionStatus status) {
        return status != null ? status : PrescriptionStatus.PENDING;
    }
}