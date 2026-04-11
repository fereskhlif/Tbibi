package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;
import tn.esprit.pi.tbibi.entities.Acte;
import tn.esprit.pi.tbibi.entities.MedicalReccords;
import tn.esprit.pi.tbibi.entities.Prescription;
import tn.esprit.pi.tbibi.entities.PrescriptionStatus;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.ActeRepo;
import tn.esprit.pi.tbibi.repositories.PrescriptionRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.ArrayList;
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
    private final EmailService emailService;
    private final NotificationService notificationService;

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

        // Preserve relationships
        updated.setActe(existing.getActe());
        updated.setMedicines(existing.getMedicines());
        updated.setTreatments(existing.getTreatments());

        // Preserve status unless explicitly provided
        updated.setStatus(
                prescription.getStatus() != null ? prescription.getStatus() : existing.getStatus()
        );
        updated.setStatusUpdatedAt(existing.getStatusUpdatedAt());

        Prescription saved = repository.save(updated);
        log.info("Prescription mise à jour avec ID: {}", saved.getPrescriptionID());

        checkAndSendImmediateAlert(saved);

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
                .map(p -> enrichWithDoctor(enrichWithPatient(mapper.toDto(p), p), p))
                .collect(Collectors.toList());
    }


    // AJOUTER cette méthode privée pour retrouver le patient via MedicalReccords
    private User findPatientByActe(Acte acte) {
        if (acte == null || acte.getMedicalFile() == null) return null;
        int medicalFileId = acte.getMedicalFile().getMedicalfile_id();
        return userRepository.findPatientByMedicalFileId(medicalFileId).orElse(null);
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
    @jakarta.transaction.Transactional
    public PrescriptionResponse assignActe(int prescriptionId, int acteId) {
        log.info("=== ASSIGN ACTE {} TO PRESCRIPTION {} ===", acteId, prescriptionId);

        Prescription existing = repository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + prescriptionId));

        Acte acte = acteRepository.findById(acteId)
                .orElseThrow(() -> new RuntimeException("Acte not found: " + acteId));

        existing.setActe(acte);
        Prescription saved = repository.save(existing);
        log.info("Acte {} assigné à la prescription {}", acteId, prescriptionId);

        checkAndSendImmediateAlert(saved);

        return enrichWithPatient(mapper.toDto(saved), saved);
    }
    @Override
    public PrescriptionResponse getById(int id) {
        log.info("=== GET BY ID: {} ===", id);
        Prescription prescr = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id));
        return enrichWithPatient(mapper.toDto(prescr), prescr);
    }

    private void checkAndSendImmediateAlert(Prescription prescription) {
        if (prescription.getExpirationDate() == null) return;

        java.time.LocalDate expDate = prescription.getExpirationDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
        long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), expDate);

        if (daysRemaining == 7 || daysRemaining == 3) {
            User patient = findPatientByActe(prescription.getActe());
            if (patient != null && patient.getEmail() != null) {
                String email = patient.getEmail();
                String name = patient.getName();
                try {
                    if (daysRemaining == 7) {
                        String msg = "Votre prescription expire dans une semaine (J-7). Pensez à renouveler votre ordonnance auprès du Dr. Tbibi.";
                        emailService.sendPrescriptionAlertMessage(email, name, msg);
                        log.info("Sent immediate J-7 alert to {}", email);
                    } else if (daysRemaining == 3) {
                        String msg = "⚠️ Alerte : Votre prescription expire bientôt (il vous reste 3 jours). Cliquez ici pour demander un renouvellement au Dr. Tbibi.";
                        emailService.sendPrescriptionAlertMessage(email, name, msg);
                        log.info("Sent immediate J-3 alert to {}", email);
                    }
                } catch (Exception e) {
                    log.error("Failed to send immediate prescription alert email to {}: {}", email, e.getMessage(), e);
                }
            }
        }
    }

    // ── Enrichissement médecin ─────────────────────────────────────────────────

    /** Récupère le nom du médecin à partir de l'ID stocké dans l'acte. */
    private PrescriptionResponse enrichWithDoctor(PrescriptionResponse dto, Prescription prescription) {
        if (prescription.getActe() == null) return dto;
        Integer doctorId = prescription.getActe().getDoctorId();
        if (doctorId == null) return dto;
        userRepository.findById(doctorId).ifPresent(doctor -> {
            dto.setDoctorId(doctor.getUserId());
            dto.setDoctorName(doctor.getName());
        });
        return dto;
    }

    // ── Prescriptions du patient connecté ─────────────────────────────────────

    /**
     * Retourne uniquement les prescriptions du patient actuellement connecté,
     * enrichies avec les infos patient ET médecin.
     */
    @Override
    @jakarta.transaction.Transactional
    public List<PrescriptionResponse> getMyPrescriptions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("=== GET MY PRESCRIPTIONS — patient: {} ===", email);

        User patient = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + email));

        // 2. Collecter toutes les prescriptions via MedicalReccords → Actes → Prescriptions
        List<PrescriptionResponse> result = new ArrayList<>();

        if (patient.getMedicalFiles() == null) return result;

        for (MedicalReccords medFile : patient.getMedicalFiles()) {
            if (medFile.getActes() == null) continue;
            for (Acte acte : medFile.getActes()) {
                if (acte.getPrescriptions() == null) continue;
                for (Prescription prescr : acte.getPrescriptions()) {
                    PrescriptionResponse dto = mapper.toDto(prescr);
                    dto.setPatientId(patient.getUserId());
                    dto.setPatientName(patient.getName());
                    dto.setPatientEmail(patient.getEmail());
                    enrichWithDoctor(dto, prescr);
                    result.add(dto);
                }
            }
        }

        log.info("Prescriptions trouvées pour le patient {}: {}", email, result.size());
        return result;
    }

    // ── Prescriptions d'analyse (pour le laboratoire) ─────────────────────────

    /**
     * Returns prescriptions whose linked Acte has typeOfActe containing "analyse".
     * Used by the laboratory portal.
     */
    @Override
    @jakarta.transaction.Transactional
    public List<PrescriptionResponse> getAnalysisPrescriptions() {
        log.info("=== GET ANALYSIS PRESCRIPTIONS ===");

        // Match all analysis subtypes: ANALYSE_DIAGNOSTIQUE, ANALYSE_MICROBIOLOGIQUE,
        // EXAMEN_ANATOMOPATHOLOGIQUE, TEST_GENETIQUE, or any value containing "ANALYSE" or "EXAMEN" or "TEST"
        java.util.Set<String> ANALYSIS_TYPES = new java.util.HashSet<>(java.util.Arrays.asList(
                "ANALYSE_DIAGNOSTIQUE", "ANALYSE_MICROBIOLOGIQUE",
                "EXAMEN_ANATOMOPATHOLOGIQUE", "TEST_GENETIQUE", "ANALYSE"
        ));

        List<Prescription> allPrescriptions = repository.findAll();
        List<PrescriptionResponse> result = allPrescriptions.stream()
                .filter(p -> p.getActe() != null
                        && p.getActe().getTypeOfActe() != null
                        && ANALYSIS_TYPES.contains(p.getActe().getTypeOfActe().toUpperCase()))
                .map(p -> enrichWithDoctor(enrichWithPatient(mapper.toDto(p), p), p))
                .collect(Collectors.toList());

        log.info("Prescriptions d'analyse trouvées: {}", result.size());
        return result;
    }

    @Override
    @jakarta.transaction.Transactional
    public PrescriptionResponse renewPrescription(int id) {
        log.info("=== RENEW PRESCRIPTION ID: {} ===", id);

        Prescription existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id));

        Prescription renewal = new Prescription();
        renewal.setActe(existing.getActe());
        
        // Copy medicines
        if (existing.getMedicines() != null) {
            renewal.setMedicines(new ArrayList<>(existing.getMedicines()));
        }

        renewal.setDate(new Date());
        renewal.setStatus(PrescriptionStatus.PENDING);
        renewal.setStatusUpdatedAt(new Date());
        
        // Let Doctor define new duration
        renewal.setExpirationDate(null);
        
        String oldNote = existing.getNote() != null ? existing.getNote() : "";
        renewal.setNote("🔄 RENEWAL REQUEST - " + oldNote);

        Prescription saved = repository.save(renewal);
        log.info("Renewal request created as Prescription ID: {}", saved.getPrescriptionID());

        // EMIT NOTIFICATION TO THE DOCTOR
        User patient = findPatientByActe(existing.getActe());
        String patientName = patient != null ? patient.getName() : "Unknown Patient";
        Integer doctorId = existing.getActe() != null ? existing.getActe().getDoctorId() : null;

        log.info("[RENEWAL NOTIF] prescriptionId={}, acte={}, doctorId={}, patientName={}",
                existing.getPrescriptionID(),
                existing.getActe() != null ? existing.getActe().getActeId() : "NULL",
                doctorId, patientName);

        String medNames = existing.getMedicines() != null && !existing.getMedicines().isEmpty()
                ? existing.getMedicines().stream().map(m -> m.getMedicineName()).collect(Collectors.joining(", "))
                : "the prescription";
        String title = patientName + "'s Renewal Request";
        String content = "The patient wishes to renew: " + medNames + " (Prescription #" + existing.getPrescriptionID() + ")";

        java.util.List<User> doctorsToNotify = new java.util.ArrayList<>();
        if (doctorId != null) {
            userRepository.findById(doctorId).ifPresent(doctorsToNotify::add);
        }

        // Fallback: if no doctorId on acte, notify ALL doctors in the system
        if (doctorsToNotify.isEmpty()) {
            log.warn("[RENEWAL NOTIF] No doctorId on acte — falling back to notifying all doctors");
            doctorsToNotify.addAll(userRepository.findAllDoctors());
        }

        log.info("[RENEWAL NOTIF] Will notify {} doctor(s)", doctorsToNotify.size());

        for (User doctor : doctorsToNotify) {
            tn.esprit.pi.tbibi.entities.Notification notif = new tn.esprit.pi.tbibi.entities.Notification();
            notif.setRecipient(doctor);
            notif.setDoctor(doctor);
            notif.setMessage(title + "||" + content);
            notif.setType(tn.esprit.pi.tbibi.entities.NotificationType.PRESCRIPTION_RENEWAL);
            notif.setRedirectUrl("/doctor/prescriptions/" + saved.getPrescriptionID());
            notif.setRead(false);
            notif.setCreatedDate(java.time.LocalDateTime.now());
            notificationService.saveAndBroadcast(notif);
            log.info("[RENEWAL NOTIF] Notification saved and broadcast to doctorId={} ({})", doctor.getUserId(), doctor.getName());
        }

        return enrichWithPatient(mapper.toDto(saved), saved);
    }
}