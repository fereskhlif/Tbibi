package tn.esprit.pi.tbibi.services;


import tn.esprit.pi.tbibi.DTO.MonitoringRequest;
import tn.esprit.pi.tbibi.DTO.MonitoringResponse;
import tn.esprit.pi.tbibi.entities.MonitoringOfChronicDisease;

public interface Monitoring_Mapper {

    MonitoringOfChronicDisease toEntity(MonitoringRequest request);

    MonitoringResponse toResponse(MonitoringOfChronicDisease entity);
}