package tn.esprit.pi.tbibi.services;

import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.MonitoringRequest;
import tn.esprit.pi.tbibi.DTO.MonitoringResponse;
import tn.esprit.pi.tbibi.entities.MonitoringOfChronicDisease;

@Component
public class MonitoringMapperImpl implements Monitoring_Mapper {

    @Override
    public MonitoringOfChronicDisease toEntity(MonitoringRequest request) {

        return MonitoringOfChronicDisease.builder()
                .diseaseName(request.getDiseaseName())
                .diagnosisDate(request.getDiagnosisDate())
                .build();
    }

    @Override
    public MonitoringResponse toResponse(MonitoringOfChronicDisease entity) {

        return MonitoringResponse.builder()
                .id(entity.getId())
                .diseaseName(entity.getDiseaseName())
                .diagnosisDate(entity.getDiagnosisDate())
                .build();
    }
}