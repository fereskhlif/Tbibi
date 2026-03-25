package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;  // ← AJOUTER CET IMPORT
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;
import tn.esprit.pi.tbibi.entities.Acte;
import tn.esprit.pi.tbibi.entities.Prescription;
import tn.esprit.pi.tbibi.entities.PrescriptionStatus;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.ActeRepo;
import tn.esprit.pi.tbibi.repositories.PrescriptionRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j  // ← AJOUTER CETTE ANNOTATION
@RequiredArgsConstructor
@Service
public class PrescriptionService implements IPrescriptionService {

    private final PrescriptionRepo repository;
    private final Prescription_Mapper mapper;
    private final ActeRepo acteRepository;
    private final UserRepo userRepository;
    @Override
    public PrescriptionResponse add(PrescriptionRequest request) {
        log.info("=== ADD PRESCRIPTION ===");
        log.info("Request reçue: note={}, date={}", request.getNote(), request.getDate());

        try {
            Prescription prescr = mapper.toEntity(request);
            log.info("Entity créée: {}", prescr);

            prescr.setStatus(PrescriptionStatus.PENDING);
            prescr.setStatusUpdatedAt(new Date());

            Prescription saved = repository.save(prescr);
            log.info("Prescription sauvegardée avec ID: {}", saved.getPrescriptionID());

            return mapper.toDto(saved);
        } catch (Exception e) {
            log.error("Erreur lors de l'ajout: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de l'ajout de la prescription", e);
        }
    }

    @Override
    public PrescriptionResponse update(int id, PrescriptionRequest prescription) {
        log.info("=== UPDATE PRESCRIPTION ID: {} ===", id);

        Prescription existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id));

        Prescription updated = mapper.toEntity(prescription);
        updated.setPrescriptionID(existing.getPrescriptionID());

        // Preserve status unless explicitly provided
        updated.setStatus(
                prescription.getStatus() != null ? prescription.getStatus() : existing.getStatus()
        );
        updated.setStatusUpdatedAt(existing.getStatusUpdatedAt());

        Prescription saved = repository.save(updated);
        log.info("Prescription mise à jour avec ID: {}", saved.getPrescriptionID());

        return mapper.toDto(saved);
    }

    @Override
    public PrescriptionResponse updateStatus(int id, PrescriptionStatus status) {
        log.info("=== UPDATE STATUS ID: {}, status: {} ===", id, status);

        Prescription existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id));

        existing.setStatus(status);
        existing.setStatusUpdatedAt(new Date());

        Prescription saved = repository.save(existing);
        log.info("Status mis à jour pour ID: {}", saved.getPrescriptionID());

        return mapper.toDto(saved);
    }

    @Override
    public void delete(int id) {
        log.info("=== DELETE PRESCRIPTION ID: {} ===", id);

        if (!repository.existsById(id)) {
            throw new RuntimeException("Prescription not found: " + id);
        }

        repository.deleteById(id);
        log.info("Prescription supprimée avec ID: {}", id);
    }

//    @Override
//    public PrescriptionResponse getById(int id) {
//        log.info("=== GET BY ID: {} ===", id);
//
//        Prescription prescr = repository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id));
//
//        log.info("Prescription trouvée: {}", prescr);
//        return mapper.toDto(prescr);
//    }

    @Override
    public List<PrescriptionResponse> getAll() {
        log.info("=== GET ALL PRESCRIPTIONS ===");

        List<Prescription> prescriptions = repository.findAll();
        log.info("Nombre de prescriptions trouvées: {}", prescriptions.size());

        return prescriptions.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }


    // AJOUTER cette méthode privée pour retrouver le patient via MedicalReccords
    private User findPatientByActe(Acte acte) {
        if (acte == null || acte.getMedicalFile() == null) return null;
        int medicalFileId = acte.getMedicalFile().getMedicalfile_id();
        return userRepository.findUserByMedicalFileId(medicalFileId).orElse(null);
    }

    // AJOUTER cette méthode privée pour enrichir le DTO avec les infos patient
    private PrescriptionResponse enrichWithPatient(PrescriptionResponse dto, Prescription prescription) {
        User patient = findPatientByActe(prescription.getActe());
        if (patient != null) {
            dto.setPatientId(patient.getUserId());
            dto.setPatientName(patient.getName());
            dto.setPatientEmail(patient.getEmail());
        }
        return dto;
    }

    @Override
    public PrescriptionResponse assignActe(int prescriptionId, int acteId) {
        log.info("=== ASSIGN ACTE {} TO PRESCRIPTION {} ===", acteId, prescriptionId);

        Prescription existing = repository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + prescriptionId));

        Acte acte = acteRepository.findById(acteId)
                .orElseThrow(() -> new RuntimeException("Acte not found: " + acteId));

        existing.setActe(acte);
        Prescription saved = repository.save(existing);
        log.info("Acte {} assigné à la prescription {}", acteId, prescriptionId);

        return enrichWithPatient(mapper.toDto(saved), saved);
    }
    @Override
    public PrescriptionResponse getById(int id) {
        log.info("=== GET BY ID: {} ===", id);
        Prescription prescr = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id));
        return enrichWithPatient(mapper.toDto(prescr), prescr);
    }
}