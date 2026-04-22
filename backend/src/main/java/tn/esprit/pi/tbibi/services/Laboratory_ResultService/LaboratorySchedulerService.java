package tn.esprit.pi.tbibi.services.Laboratory_ResultService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;
import tn.esprit.pi.tbibi.repositories.Laboratory_ResultRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LaboratorySchedulerService {

    private final Laboratory_ResultRepository labRepo;

    @Scheduled(fixedRate = 3600000)
    public void processUrgentPendingResults() {
        log.info("🔄 [SCHEDULER] Starting urgent pending results check...");

        LocalDateTime twoHoursAgo = LocalDateTime.now().minusHours(2);

        List<Laboratory_Result> urgentResults = labRepo.findByStatusAndPriorityAndCreatedAtBefore(
                "Pending",
                List.of("Urgent", "Critical"),
                twoHoursAgo
        );

        int updatedCount = 0;
        for (Laboratory_Result result : urgentResults) {
            result.setStatus("In Progress");
            result.setNotificationMessage(
                    "⚠️ URGENT: Test '" + result.getTestName() +
                            "' has been pending for over 2 hours. Priority: " + result.getPriority()
            );
            result.setNotificationSent(true);
            result.setNotificationDate(LocalDate.now());

            labRepo.save(result);
            updatedCount++;

            log.info("📢 Escalated urgent result: {} (Priority: {})",
                    result.getTestName(), result.getPriority());
        }

        log.info("✅ [SCHEDULER] Processed {} urgent pending results", updatedCount);
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void archiveOldCompletedResults() {
        log.info("🔄 [SCHEDULER] Starting old results archiving...");

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<Laboratory_Result> oldResults = labRepo.findByStatusAndCreatedAtBefore(
                "Completed",
                thirtyDaysAgo
        );

        int archivedCount = 0;
        for (Laboratory_Result result : oldResults) {
            result.setStatus("Archived");
            result.setNotificationMessage(
                    "📦 Result archived after 30 days: " + result.getTestName()
            );

            labRepo.save(result);
            archivedCount++;
        }

        log.info("✅ [SCHEDULER] Archived {} old completed results", archivedCount);
    }

    @Scheduled(fixedRate = 21600000)
    public void sendValidationReminders() {
        log.info("🔄 [SCHEDULER] Starting validation reminders check...");

        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);

        List<Laboratory_Result> unvalidatedResults = labRepo.findByStatusAndCreatedAtBefore(
                "Completed",
                twentyFourHoursAgo
        );

        int reminderCount = 0;
        for (Laboratory_Result result : unvalidatedResults) {
            if (result.getPrescribedByDoctor() != null) {
                result.setNotificationMessage(
                        "⏰ REMINDER: Result '" + result.getTestName() +
                                "' awaiting validation for patient: " +
                                (result.getPatient() != null ? result.getPatient().getName() : "Unknown")
                );
                result.setNotificationSent(true);
                result.setNotificationDate(LocalDate.now());

                labRepo.save(result);
                reminderCount++;

                log.info("📧 Sent validation reminder for: {}", result.getTestName());
            }
        }

        log.info("✅ [SCHEDULER] Sent {} validation reminders", reminderCount);
    }
}