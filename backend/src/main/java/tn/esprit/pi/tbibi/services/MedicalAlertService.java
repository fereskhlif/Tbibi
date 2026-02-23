package tn.esprit.pi.tbibi.services;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.MedicalAlertRequest;
import tn.esprit.pi.tbibi.DTO.MedicalAlertResponse;
import tn.esprit.pi.tbibi.entities.MedicalAlert;
import tn.esprit.pi.tbibi.repositories.MedicalAlertRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalAlertService implements IMedicalAlertService {

    private final MedicalAlertRepository repository;
    private final MedicalAlertMapper mapper;

    @Override
    public List<MedicalAlertResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalAlertResponse add(MedicalAlertRequest request) {

        MedicalAlert entity = mapper.toEntity(request);

        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public MedicalAlertResponse update(Long id,
                                       MedicalAlertRequest request) {

        MedicalAlert entity = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Not found"));

        entity.setTitle(request.getTitle());
        entity.setMessage(request.getMessage());
        entity.setSeverity(request.getSeverity());

        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}