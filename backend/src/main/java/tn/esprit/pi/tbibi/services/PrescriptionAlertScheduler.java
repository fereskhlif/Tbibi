package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.entities.Prescription;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.PrescriptionRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class PrescriptionAlertScheduler {

    private final PrescriptionRepo prescriptionRepo;
    private final EmailService emailService;
    private final UserRepo userRepository;

    // Run this task daily at 8:00 AM: "0 0 8 * * *"
    // For fast testing, you could use fixedRate = 60000 (every minute).
    // The user approved "une fois par jour", so we'll set it to 8 AM.
    // However, I will set it to run once everyday at midnight ("0 0 0 * * *") or 8AM ("0 0 8 * * *").
    @Scheduled(cron = "0 0 8 * * *")
    public void sendPrescriptionAlerts() {
        log.info("Starting automated prescription alert check...");
        List<Prescription> activePrescriptions = prescriptionRepo.findByExpirationDateIsNotNull();

        for (Prescription p : activePrescriptions) {
            LocalDate expDate = p.getExpirationDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), expDate);

            // Fetch the patient directly like in PrescriptionService
            if (p.getActe() == null || p.getActe().getMedicalFile() == null) {
                continue;
            }

            int medicalFileId = p.getActe().getMedicalFile().getMedicalfile_id();
            User patient = userRepository.findPatientByMedicalFileId(medicalFileId).orElse(null);

            if (patient != null && patient.getEmail() != null) {
                String email = patient.getEmail();
                String name = patient.getName();

                try {
                    if (daysRemaining == 7) {
                        String medNames = p.getMedicines() != null ? 
                            p.getMedicines().stream().map(m -> m.getMedicineName()).toList().toString() : "votre traitement";
                        String msg = "Votre prescription expire dans une semaine. Avez-vous assez de médicaments ? (" + medNames + ")";
                        emailService.sendPrescriptionAlertMessage(email, name, msg);
                        log.info("Sent J-7 alert to {}", email);
                    } else if (daysRemaining == 3) {
                        String msg = "⚠️ Alerte : Votre prescription expire bientôt (il vous reste 3 jours). Cliquez ici pour demander un renouvellement au Dr. Tbibi.";
                        emailService.sendPrescriptionAlertMessage(email, name, msg);
                        log.info("Sent J-3 alert to {}", email);
                    } else if (daysRemaining == 0) {
                        String msg = "🛑 Stop: Votre prescription se termine aujourd'hui. Veuillez prendre rendez-vous pour la suite des démarches.";
                        emailService.sendPrescriptionAlertMessage(email, name, msg);
                        log.info("Sent J-0 alert to {}", email);
                    }
                } catch (Exception e) {
                    log.error("Failed to send prescription alert email to {}: {}", email, e.getMessage(), e);
                }
            }
        }
        log.info("Finished automated prescription alert check.");
    }
}
