package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.MonitoringRequest;
import tn.esprit.pi.tbibi.DTO.MonitoringResponse;
import tn.esprit.pi.tbibi.entities.MonitoringOfChronicDisease;
import tn.esprit.pi.tbibi.repositories.MonitoringRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MonitoringService implements IMonitoringService {

    private final MonitoringRepository repository;
    private final Monitoring_Mapper mapper;

    @Override
    public List<MonitoringResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MonitoringResponse add(MonitoringRequest request) {

        MonitoringOfChronicDisease entity =
                mapper.toEntity(request);

        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public MonitoringResponse update(Long id,
                                     MonitoringRequest request) {

        MonitoringOfChronicDisease entity =
                repository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Not found"));

        entity.setDiseaseName(request.getDiseaseName());
        entity.setDiagnosisDate(request.getDiagnosisDate());

        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}