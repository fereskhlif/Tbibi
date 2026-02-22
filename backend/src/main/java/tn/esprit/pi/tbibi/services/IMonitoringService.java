package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.MonitoringRequest;
import tn.esprit.pi.tbibi.DTO.MonitoringResponse;

import java.util.List;

public interface IMonitoringService {

    List<MonitoringResponse> getAll();

    MonitoringResponse add(MonitoringRequest request);

    MonitoringResponse update(Long id, MonitoringRequest request);

    void delete(Long id);
}
