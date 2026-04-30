package tn.esprit.pi.tbibi.services;

import org.springframework.stereotype.Component;
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

@Component
public class Prescription_Mapper {

    public Prescription toEntity(PrescriptionRequest request) {
        if (request == null) return null;
        Prescription p = new Prescription();
        p.setNote(request.getNote());
        p.setDate(request.getDate());
        p.setExpirationDate(request.getExpirationDate());
        // medicines, status, statusUpdatedAt, acte, treatments are handled by the service
        return p;
    }

    public PrescriptionResponse toDto(Prescription entity) {
        if (entity == null) return null;

        PrescriptionResponse dto = new PrescriptionResponse();
        dto.setPrescriptionID(entity.getPrescriptionID());
        dto.setNote(entity.getNote());
        dto.setDate(dateToIso(entity.getDate()));
        dto.setExpirationDate(dateToIso(entity.getExpirationDate()));
        dto.setStatusUpdatedAt(dateToIso(entity.getStatusUpdatedAt()));
        dto.setStatus(entity.getStatus() != null ? entity.getStatus() : PrescriptionStatus.PENDING);

        if (entity.getActe() != null) {
            dto.setActeId(entity.getActe().getActeId());
            dto.setActeType(entity.getActe().getTypeOfActe());
        }

        // Map medicines list
        if (entity.getMedicines() != null && !entity.getMedicines().isEmpty()) {
            List<PrescriptionResponse.MedicineInfo> infos = entity.getMedicines().stream()
                .map(m -> PrescriptionResponse.MedicineInfo.builder()
                    .medicineId(m.getMedicineId())
                    .medicineName(m.getMedicineName())
                    .quantity(m.getQuantity())
                    .dosage(m.getDosage())
                    .activeIngredient(m.getActiveIngredient())
                    .build())
                .collect(Collectors.toList());
            dto.setMedicines(infos);
        } else {
            dto.setMedicines(Collections.emptyList());
        }

        // patientId, patientName, patientEmail, doctorId, doctorName are enriched by the service
        return dto;
    }

    private String dateToIso(Date date) {
        if (date == null) return null;
        return DateTimeFormatter.ISO_INSTANT
                .format(Instant.ofEpochMilli(date.getTime()).atOffset(ZoneOffset.UTC));
    }
}