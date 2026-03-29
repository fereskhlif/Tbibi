package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.ActeRequest;
import tn.esprit.pi.tbibi.DTO.HistoryRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import tn.esprit.pi.tbibi.DTO.PatientRecordDTO;
import tn.esprit.pi.tbibi.entities.Acte;
import tn.esprit.pi.tbibi.entities.MedicalReccords;
import tn.esprit.pi.tbibi.entities.Prescription;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.ActeRepo;
import tn.esprit.pi.tbibi.repositories.MedicalReccordsRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j  // ← AJOUTER CETTE ANNOTATION
@RequiredArgsConstructor
@Service
public class MedicalRec implements IMedicalReccordsService {

    private final MedRec_Mapper mapper;
    private final MedicalReccordsRepo repository;
    private static final String UPLOAD_DIR = "uploads/";
    private final ActeRepo acteRepo;
    private final Acte_Mapper acteMapper;
    private final UserRepo userRepo;
    private final tn.esprit.pi.tbibi.repositories.PrescriptionRepo prescriptionRepo;

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
    @org.springframework.transaction.annotation.Transactional
    public MdicalReccordsResponse addForPatient(String email, MdicalReccordsRequest request) {
        log.info("=== ADD RECORD FOR PATIENT ===");
        User patient = userRepo.findByEmail(email).orElse(null);
        MedicalReccords entity = mapper.toEntity(request);
        entity.setImageUrl(request.getImageUrl());
        MedicalReccords saved = repository.save(entity);
        if (patient != null) {
            if (patient.getMedicalFiles() == null) {
                patient.setMedicalFiles(new ArrayList<>());
            }
            patient.getMedicalFiles().add(saved);

            // Append patient's note to the Master Record (get(0)) so the Doctor automatically sees it in "History"
            if (patient.getMedicalFiles().size() > 1) {
                MedicalReccords master = patient.getMedicalFiles().get(0);
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                
                StringBuilder sb = new StringBuilder();
                sb.append("─── Visite du ").append(timestamp).append(" (Note Patient) ───");
                
                if (request.getMedical_historuy() != null && !request.getMedical_historuy().isBlank()) {
                    sb.append("\nNotes         : ").append(request.getMedical_historuy());
                }
                if (request.getChronic_diseas() != null && !request.getChronic_diseas().isBlank()) {
                    sb.append("\nMaladies ch.  : ").append(request.getChronic_diseas());
                }

                String existing = master.getMedical_historuy();
                master.setMedical_historuy(existing == null || existing.isBlank() ? sb.toString() : existing + "\n\n" + sb.toString());
                repository.save(master);
            }

            userRepo.save(patient);
        }
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

        log.info("Responses à retourner: {}", responses.size());
        return responses;
    }

    @org.springframework.transaction.annotation.Transactional
    @Override
    public List<PatientRecordDTO> searchPatientsByName(String name) {
        log.info("=== SEARCH PATIENTS BY NAME: {} ===", name);
        List<User> patients = (name == null || name.isBlank())
                ? userRepo.findAllUsersByRoleName("PATIENT")
                : userRepo.searchAllPatientsByName(name);

        List<PatientRecordDTO> result = new ArrayList<>();
        for (User patient : patients) {
            MedicalReccords record;
            if (patient.getMedicalFiles() != null && !patient.getMedicalFiles().isEmpty()) {
                record = patient.getMedicalFiles().get(0);
            } else {
                record = new MedicalReccords();
                record = repository.save(record);
                if (patient.getMedicalFiles() == null) {
                    patient.setMedicalFiles(new ArrayList<>());
                }
                patient.getMedicalFiles().add(record);
                userRepo.save(patient);
            }

            // Fetch associated prescriptions from Actes
            java.util.List<tn.esprit.pi.tbibi.DTO.PrescriptionMinimalDTO> prescriptions = new java.util.ArrayList<>();
            if (record.getActes() != null) {
                record.getActes().forEach(acte -> {
                    if (acte.getPrescriptions() != null) {
                        acte.getPrescriptions().forEach(p -> {
                            prescriptions.add(new tn.esprit.pi.tbibi.DTO.PrescriptionMinimalDTO(
                                    p.getPrescriptionID(),
                                    p.getNote(),
                                    p.getDate(),
                                    p.getStatus()
                            ));
                        });
                    }
                });
            }

            result.add(PatientRecordDTO.builder()
                    .medicalFileId(record.getMedicalfile_id())
                    .patientName(patient.getName())
                    .patientEmail(patient.getEmail())
                    .medicalHistory(record.getMedical_historuy())
                    .chronicDisease(record.getChronic_diseas())
                    .repDoc(record.getRep_doc())
                    .existingPrescriptions(prescriptions)
                    .build());
        }
        log.info("Patients trouvés: {}", result.size());
        return result;
    }

    @Override
    @jakarta.transaction.Transactional
    public MdicalReccordsResponse appendHistory(int medicalFileId, HistoryRequest request, String doctorEmail) {
        log.info("=== APPEND HISTORY TO RECORD {} ===", medicalFileId);
        MedicalReccords record = repository.findById(medicalFileId)
                .orElseThrow(() -> new RuntimeException("Record not found: " + medicalFileId));

        String doctorName = request.getDoctorName();
        if ((doctorName == null || doctorName.isBlank()) && doctorEmail != null) {
            User doctor = userRepo.findByEmail(doctorEmail).orElse(null);
            if (doctor != null) {
                doctorName = doctor.getName();
            }
        }

        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        // Build a structured history entry
        StringBuilder entry = new StringBuilder();
        entry.append("─── Visite du ").append(timestamp).append(" ───");
        if (doctorName != null && !doctorName.isBlank()) {
            entry.append("\nMédecin       : Dr. ").append(doctorName);
        }
        if (request.getFiliere() != null && !request.getFiliere().isBlank()) {
            entry.append("\nFilière       : ").append(request.getFiliere());
        }
        if (request.getVisitNote() != null && !request.getVisitNote().isBlank()) {
            entry.append("\nNotes         : ").append(request.getVisitNote());
        }
        if (request.getAnalyseSanguine() != null && !request.getAnalyseSanguine().isBlank()) {
            entry.append("\nAnalyse sang. : ").append(request.getAnalyseSanguine());
        }
        if (request.getVaccination() != null && !request.getVaccination().isBlank()) {
            entry.append("\nVaccination   : ").append(request.getVaccination());
        }

        // Nouveaux champs
        if (request.getPrescriptions() != null && !request.getPrescriptions().isEmpty()) {
            entry.append("\nPrescriptions : ").append(String.join(" | ", request.getPrescriptions()));
        }
        if (request.getAutre() != null && !request.getAutre().isBlank()) {
            entry.append("\nAutre signaler: ").append(request.getAutre());
        }
        if (request.getVaccines() != null && !request.getVaccines().isEmpty()) {
            for (tn.esprit.pi.tbibi.DTO.VaccineRequest v : request.getVaccines()) {
                entry.append("\nVaccin        : ").append(v.getNom() != null ? v.getNom() : "")
                        .append(" | Type: ").append(v.getType() != null ? v.getType() : "")
                        .append(" | Obs: ").append(v.getObservation() != null ? v.getObservation() : "");
            }
        }
        if (request.getAppareilUrinaire() != null && !request.getAppareilUrinaire().isBlank()) {
            entry.append("\nApp. Urinaire : ").append(request.getAppareilUrinaire());
        }
        if (request.getUrinaryExams() != null && !request.getUrinaryExams().isEmpty()) {
            entry.append("\nExams. Urin.  :");
            for (tn.esprit.pi.tbibi.DTO.UrinaryExamRequest u : request.getUrinaryExams()) {
                entry.append("\n  - ").append(u.getLibelle() != null ? u.getLibelle() : "")
                        .append(" | Date: ").append(u.getDate() != null ? u.getDate() : "")
                        .append(" | Mal Ant.: ").append(u.getMalAnt() != null ? u.getMalAnt() : "")
                        .append(" | Catégorie: ").append(u.getCategorie() != null ? u.getCategorie() : "")
                        .append(" | N° Tab MP: ").append(u.getNTabMp() != null ? u.getNTabMp() : "")
                        .append(" | D.Déc: ").append(u.getDDec() != null ? u.getDDec() : "")
                        .append(" | A.Causal: ").append(u.getACausal() != null ? u.getACausal() : "");
            }
        }

        // Créer l'Acte correspondant à la visite
        Acte newVisitActe = new Acte();
        newVisitActe.setDate(new java.util.Date());
        newVisitActe.setTypeOfActe(request.getFiliere() != null && !request.getFiliere().isBlank() ? request.getFiliere() : "Visite Médicale");
        newVisitActe.setDescription(request.getVisitNote() != null ? request.getVisitNote() : "Nouvelle visite");
        newVisitActe.setMedicalFile(record);
        if (doctorEmail != null) {
            User doc = userRepo.findByEmail(doctorEmail).orElse(null);
            if (doc != null) newVisitActe.setDoctorId(doc.getUserId());
        }

        // Lier l'acte aux prescriptions s'il y en a
        List<Prescription> linkedPrescriptions = new ArrayList<>();
        if (request.getPrescriptions() != null && !request.getPrescriptions().isEmpty()) {
            for (String pIdStr : request.getPrescriptions()) {
                try {
                    int pId = Integer.parseInt(pIdStr.trim());
                    Prescription p = prescriptionRepo.findById(pId).orElse(null);
                    if (p != null) {
                        p.setActe(newVisitActe);
                        linkedPrescriptions.add(p);
                    }
                } catch (NumberFormatException e) {
                    log.warn("Invalid prescription ID: {}", pIdStr);
                }
            }
        }
        newVisitActe.setPrescriptions(linkedPrescriptions);

        if (record.getActes() == null) {
            record.setActes(new ArrayList<>());
        }
        record.getActes().add(newVisitActe);
        String existing = record.getMedical_historuy();
        String updated = (existing == null || existing.isBlank())
                ? entry.toString()
                : existing + "\n\n" + entry;

        record.setMedical_historuy(updated);
        MedicalReccords saved = repository.save(record);
        log.info("Historique mis à jour pour record {}", medicalFileId);
        return mapper.toResponse(saved);
    }

    // ── Patient self-service methods ─────────────────────────────────────────

    private static final String PATIENT_IMAGE_DIR = "uploads/patient-images/";

    /** Returns (or auto-creates) the medical record for the authenticated patient. */
    @Override
    public List<MdicalReccordsResponse> getMyRecord(String email) {
        log.info("=== GET MY RECORD for email: {} ===", email);
        User patient = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (patient.getMedicalFiles() == null || patient.getMedicalFiles().isEmpty()) {
            return new ArrayList<>();
        }

        List<MdicalReccordsResponse> responses = new ArrayList<>();
        for (MedicalReccords record : patient.getMedicalFiles()) {
            responses.add(mapper.toResponse(record));
        }
        return responses;
    }

    /** Saves one image file and appends its serving URL to the patient's record. */
    @Override
    @org.springframework.transaction.annotation.Transactional
    public MdicalReccordsResponse uploadPatientImage(String email, org.springframework.web.multipart.MultipartFile file) {
        log.info("=== UPLOAD PATIENT IMAGE for email: {} ===", email);
        User patient = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        MedicalReccords record;
        if (patient.getMedicalFiles() != null && !patient.getMedicalFiles().isEmpty()) {
            record = patient.getMedicalFiles().get(0);
        } else {
            record = new MedicalReccords();
            record = repository.save(record);
            if (patient.getMedicalFiles() == null) patient.setMedicalFiles(new ArrayList<>());
            patient.getMedicalFiles().add(record);
            userRepo.save(patient);
        }

        try {
            java.nio.file.Files.createDirectories(java.nio.file.Paths.get(PATIENT_IMAGE_DIR));
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path path = java.nio.file.Paths.get(PATIENT_IMAGE_DIR + fileName);
            java.nio.file.Files.write(path, file.getBytes());
            String imageUrl = "/uploads/patient-images/" + fileName;
            if (record.getPatientImages() == null) record.setPatientImages(new ArrayList<>());
            record.getPatientImages().add(imageUrl);
            MedicalReccords saved = repository.save(record);
            log.info("Image patient sauvegardée: {}", imageUrl);
            return mapper.toResponse(saved);
        } catch (Exception e) {
            log.error("Erreur upload image patient: {}", e.getMessage());
            throw new RuntimeException("Erreur upload image : " + e.getMessage());
        }
    }

    /** Allows the patient to update their own editable medical record fields. */
    @Override
    @org.springframework.transaction.annotation.Transactional
    public MdicalReccordsResponse updateMyRecord(String email, MdicalReccordsRequest request) {
        log.info("=== UPDATE MY RECORD for email: {} ===", email);
        User patient = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        MedicalReccords record;
        if (patient.getMedicalFiles() != null && !patient.getMedicalFiles().isEmpty()) {
            record = patient.getMedicalFiles().get(0);
        } else {
            record = new MedicalReccords();
            record = repository.save(record);
            if (patient.getMedicalFiles() == null) patient.setMedicalFiles(new ArrayList<>());
            patient.getMedicalFiles().add(record);
            userRepo.save(patient);
        }

        if (request.getMedical_historuy() != null) {
            String existing = record.getMedical_historuy();
            // Append instead of overwrite to protect any doctor notes if this is the master record
            if (existing != null && existing.contains("─── Visite du")) {
                record.setMedical_historuy(existing + "\n\n─── Modification Patient ───\n" + request.getMedical_historuy());
            } else {
                record.setMedical_historuy(request.getMedical_historuy());
            }
        }
        if (request.getChronic_diseas() != null) {
            record.setChronic_diseas(request.getChronic_diseas());
        }

        MedicalReccords saved = repository.save(record);
        log.info("Record patient mis à jour: id={}", saved.getMedicalfile_id());
        return mapper.toResponse(saved);
    }

    /** Removes one patient image path from the record. */
    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deletePatientImage(String email, String imagePath) {
        log.info("=== DELETE PATIENT IMAGE for email: {}, path: {} ===", email, imagePath);
        User patient = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (patient.getMedicalFiles() == null || patient.getMedicalFiles().isEmpty()) {
            throw new RuntimeException("No medical record found for patient");
        }
        MedicalReccords record = patient.getMedicalFiles().get(0);
        if (record.getPatientImages() != null) {
            record.getPatientImages().remove(imagePath);
            repository.save(record);
            // Optionally delete from disk
            try {
                String diskPath = "." + imagePath; // e.g. ./uploads/patient-images/xxx.jpg
                java.nio.file.Files.deleteIfExists(java.nio.file.Paths.get(diskPath));
            } catch (Exception e) {
                log.warn("Could not delete file from disk: {}", e.getMessage());
            }
        }
    }
}