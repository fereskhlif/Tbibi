package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.*;
import tn.esprit.pi.tbibi.entities.HealthGoal;
import tn.esprit.pi.tbibi.repositories.HealthGoalRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthGoalService implements IHealthGoalService {

    private final HealthGoalRepository repository;
    private final HealthGoalMapper mapper;

    @Override
    public List<HealthGoalResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HealthGoalResponse add(HealthGoalRequest request) {
        HealthGoal entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public HealthGoalResponse update(Long id, HealthGoalRequest request) {

        HealthGoal entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        entity.setGoalTitle(request.getGoalTitle());
        entity.setDescription(request.getDescription());
        entity.setTargetDate(request.getTargetDate());

        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}