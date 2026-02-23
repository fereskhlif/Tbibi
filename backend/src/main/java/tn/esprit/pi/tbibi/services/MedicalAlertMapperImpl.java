package tn.esprit.pi.tbibi.services;

import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.MedicalAlertRequest;
import tn.esprit.pi.tbibi.DTO.MedicalAlertResponse;
import tn.esprit.pi.tbibi.entities.MedicalAlert;

import java.time.LocalDateTime;

@Component
public class MedicalAlertMapperImpl implements MedicalAlertMapper {

    @Override
    public MedicalAlert toEntity(MedicalAlertRequest request) {

        return MedicalAlert.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .severity(request.getSeverity())
                .createdAt(LocalDateTime.now())
                .readStatus(false)
                .build();
    }

    @Override
    public MedicalAlertResponse toResponse(MedicalAlert entity) {

        return MedicalAlertResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .severity(entity.getSeverity())
                .createdAt(entity.getCreatedAt())
                .readStatus(entity.isReadStatus())
                .build();
    }
}