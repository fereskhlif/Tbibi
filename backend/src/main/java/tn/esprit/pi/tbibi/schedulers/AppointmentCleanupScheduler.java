package tn.esprit.pi.tbibi.schedulers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;

import java.time.LocalDate;

/**
 * Nightly task that permanently removes appointments whose schedule date has
 * already passed (i.e. schedule.date < today).
 *
 * Runs every day at 07:00 AM server time.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentCleanupScheduler {

    private final AppointmentRepo appointmentRepo;

    /**
     * Cron expression: second=0, minute=0, hour=7, every day, every month, every weekday.
     * "0 0 7 * * ?" → fires at 07:00:00 AM every day.
     */
    @Scheduled(cron = "0 0 7 * * ?")
    @Transactional
    public void deletePastAppointments() {
        LocalDate today = LocalDate.now();
        log.info("[AppointmentCleanup] Starting cleanup — deleting appointments before {}", today);

        int deleted = appointmentRepo.deleteByScheduleDateBefore(today);

        if (deleted > 0) {
            log.info("[AppointmentCleanup] Deleted {} past appointment(s).", deleted);
        } else {
            log.info("[AppointmentCleanup] No past appointments found to delete.");
        }
    }
}
