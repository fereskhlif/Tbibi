package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;
import tn.esprit.pi.tbibi.entities.Prescription;
import tn.esprit.pi.tbibi.repositories.PrescriptionRepo;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class PrescriptionService implements IPrescriptionService {
    private final PrescriptionRepo repository;
    private final Prescription_Mapper mapper;

    @Override
    public PrescriptionResponse add(PrescriptionRequest prescription) {
        Prescription prescr = mapper.toEntity(prescription);
        return mapper.toDto(repository.save(prescr));
    }

    @Override
    public PrescriptionResponse update(int id, PrescriptionRequest prescription) {
        Prescription existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id));
        Prescription updated = mapper.toEntity(prescription);
        updated.setPrescriptionID(existing.getPrescriptionID());
        return mapper.toDto(repository.save(updated));
    }

    @Override
    public void delete(int id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Prescription not found: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public PrescriptionResponse getById(int id) {
        Prescription prescr = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id));
        return mapper.toDto(prescr);
    }

    @Override
    public List<PrescriptionResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}