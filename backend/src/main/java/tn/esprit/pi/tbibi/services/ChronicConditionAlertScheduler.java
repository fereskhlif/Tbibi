package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.entities.ChronicCondition;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.ChronicConditionRepo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChronicConditionAlertScheduler {

    private final ChronicConditionRepo repo;
    private final EmailService emailService;

    @Scheduled(cron = "0 30 8 * * *")
    public void checkRecentCriticalReadings() {
        log.info("Starting ChronicConditionAlertScheduler: checking for recent CRITICAL readings...");

        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);

        List<ChronicCondition> allCritical = repo.findAll().stream()
                .filter(c -> "CRITICAL".equals(c.getSeverity()))
                .filter(c -> c.getRecordedAt() != null && c.getRecordedAt().isAfter(cutoff))
                .toList();

        int alertedCount = 0;
        String alertTag = "[ALERT SENT";

        for (ChronicCondition cc : allCritical) {
            String notes = cc.getNotes() == null ? "" : cc.getNotes();

            if (notes.contains(alertTag)) {
                continue;
            }

            User patient = cc.getPatient();
            if (patient != null && patient.getEmail() != null && !patient.getEmail().isBlank()) {
                log.info("Sending health safety alert for patient: {}", patient.getName());

                try {

                    String warningMsg = String.format(
                            "Alerte: Votre %s a dépassé les limites sures avec une valeur de %s. Veuillez consulter un médecin immédiatement.",
                            cc.getConditionType(), cc.getValue());
                    emailService.sendPrescriptionAlertMessage(patient.getEmail(), patient.getName(), warningMsg);

                    cc.setNotes(notes + (notes.isEmpty() ? "" : " ") + "[ALERT SENT " + LocalDate.now() + "]");
                    repo.save(cc);
                    alertedCount++;

                } catch (Exception e) {
                    log.error("Failed to send critical health alert to {}: {}", patient.getEmail(), e.getMessage());
                }
            }
        }

        log.info("Finished ChronicConditionAlertScheduler: {} physical alerts sent.", alertedCount);
    }
}
