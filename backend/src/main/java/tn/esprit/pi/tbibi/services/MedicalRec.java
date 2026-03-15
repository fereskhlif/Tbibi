package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;  // ← AJOUTER CET IMPORT
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.ActeRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import tn.esprit.pi.tbibi.entities.Acte;
import tn.esprit.pi.tbibi.entities.MedicalReccords;
import tn.esprit.pi.tbibi.repositories.ActeRepo;
import tn.esprit.pi.tbibi.repositories.MedicalReccordsRepo;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Slf4j  // ← AJOUTER CETTE ANNOTATION
@RequiredArgsConstructor
@Service
public class MedicalRec implements IMedicalReccordsService {

    private final MedRec_Mapper mapper;
    private final MedicalReccordsRepo repository;
    private static final String UPLOAD_DIR = "uploads/";
    private final ActeRepo acteRepo;        // ← ADD THIS
    private final Acte_Mapper acteMapper;

    // ── File helper (PDF) ────────────────────────────────────────────────────

    private String saveFile(MultipartFile file) {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.write(path, file.getBytes());
            log.info("Fichier sauvegardé: {}", fileName);  // ← AJOUTER LOG
            return fileName;
        } catch (Exception e) {
            log.error("Erreur upload: {}", e.getMessage());  // ← AJOUTER LOG
            throw new RuntimeException("Erreur upload : " + e.getMessage());
        }
    }
    @Override
    public MdicalReccordsResponse addActe(int recordId, ActeRequest request) {
        log.info("=== ADD ACTE TO RECORD {} ===", recordId);

        MedicalReccords record = repository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Medical record not found: " + recordId));

        Acte acte = acteMapper.toEntity(request);
        acte.setMedicalFile(record);
        acte.setPrescriptions(new ArrayList<>());

        Acte savedActe = acteRepo.save(acte);

        if (record.getActes() == null) {
            record.setActes(new ArrayList<>());
        }
        record.getActes().add(savedActe);

        MedicalReccords saved = repository.save(record);
        log.info("Acte ajouté avec succès, ID: {}", savedActe.getActeId());

        return mapper.toResponse(saved);
    }

    // ── Add with PDF file (multipart — kept for compatibility) ───────────────

    @Override
    public MdicalReccordsResponse add(MdicalReccordsRequest request, MultipartFile file) {
        log.info("=== ADD WITH FILE ===");  // ← AJOUTER LOG
        log.info("Request: {}", request);    // ← AJOUTER LOG

        MedicalReccords entity = mapper.toEntity(request);
        if (file != null && !file.isEmpty()) {
            entity.setRep_doc(saveFile(file));
        }
        entity.setImageUrl(request.getImageUrl());

        MedicalReccords saved = repository.save(entity);
        log.info("Record sauvegardé avec ID: {}", saved.getMedicalfile_id());  // ← AJOUTER LOG

        return mapper.toResponse(saved);
    }
    @Override
    public MdicalReccordsResponse add(MdicalReccordsRequest request) {
        log.info("=== ADD WITH JSON ===");
        log.info("Request reçue: imageLabo={}, result_ia={}, medical_historuy={}, chronic_diseas={}",
                request.getImageLabo(),
                request.getResult_ia(),
                request.getMedical_historuy(),
                request.getChronic_diseas());

        MedicalReccords entity = mapper.toEntity(request);
        entity.setImageUrl(request.getImageUrl());

        MedicalReccords saved = repository.save(entity);
        log.info("Record sauvegardé avec ID: {}", saved.getMedicalfile_id());
        return mapper.toResponse(saved);
    }
    @Override
    public MdicalReccordsResponse update(int id, MdicalReccordsRequest request) {
        log.info("=== UPDATE ID: {} ===", id);

        MedicalReccords entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found with id: " + id));

        entity.setImageLabo(request.getImageLabo());
        entity.setResult_ia(request.getResult_ia());
        entity.setMedical_historuy(request.getMedical_historuy());
        entity.setChronic_diseas(request.getChronic_diseas());

        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            entity.setImageUrl(request.getImageUrl());
        }

        MedicalReccords saved = repository.save(entity);
        log.info("Record mis à jour avec ID: {}", saved.getMedicalfile_id());

        return mapper.toResponse(saved);
    }
    @Override
    public void delete(int id) {
        log.info("=== DELETE ID: {} ===", id);  // ← AJOUTER LOG
        repository.deleteById(id);
        log.info("Record supprimé avec ID: {}", id);  // ← AJOUTER LOG
    }
    @Override
    public MdicalReccordsResponse getById(int id) {
        log.info("=== GET BY ID: {} ===", id);  // ← AJOUTER LOG

        MedicalReccords entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found with id: " + id));

        MdicalReccordsResponse response = mapper.toResponse(entity);
        log.info("Record trouvé: {}", response);  // ← AJOUTER LOG

        return response;
    }
    @Override
    public List<MdicalReccordsResponse> getAll() {
        log.info("=== SERVICE GET ALL ===");  // ← MAINTENANT log FONCTIONNE
        List<MedicalReccords> entities = repository.findAll();
        log.info("Entities trouvées: {}", entities.size());

        List<MdicalReccordsResponse> responses = new ArrayList<>();
        for (MedicalReccords entity : entities) {
            MdicalReccordsResponse response = mapper.toResponse(entity);
            log.debug("Response convertie: {}", response);  // ← AJOUTER LOG (debug)
            responses.add(response);
        }

        log.info("Responses à retourner: {}", responses.size());  // ← AJOUTER LOG
        return responses;
    }
}