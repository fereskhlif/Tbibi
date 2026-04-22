package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.NotificationType;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.StatusAppointement;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentScheduler {

    private final AppointmentRepo appointmentRepo;
    private final ScheduleRepo scheduleRepo;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 7 * * *")
    public void autoCancelStaleAppointments() {
        log.info("Starting AppointmentScheduler: checking for stale PENDING appointments...");

        List<Appointment> pendingAppointments = appointmentRepo.findByStatusAppointement(StatusAppointement.PENDING);
        LocalDate today = LocalDate.now();
        int cancelledCount = 0;

        for (Appointment appointment : pendingAppointments) {
            Schedule schedule = appointment.getSchedule();
            if (schedule != null && schedule.getDate() != null && schedule.getDate().isBefore(today)) {
                log.info("Auto-cancelling stale appointment ID: {}", appointment.getAppointmentId());

                appointment.setStatusAppointement(StatusAppointement.CANCELLED);
                appointmentRepo.save(appointment);

                schedule.setIsAvailable(true);
                scheduleRepo.save(schedule);

                cancelledCount++;

                // Notify the patient
                if (appointment.getUser() != null) {
                    String msg = "Your pending appointment for " + appointment.getSpecialty() + " on "
                            + schedule.getDate() + " was automatically cancelled as it was not confirmed in time.";
                    notificationService.createAndSend(appointment.getUser(), msg, NotificationType.APPOINTMENT,
                            "/patient/appointments");
                }

                // Notify the doctor
                if (schedule.getDoctor() != null) {
                    String msg = "A pending appointment request from " + appointment.getPatientName() + " on "
                            + schedule.getDate() + " expired and was automatically cancelled.";
                    notificationService.createAndSend(schedule.getDoctor(), msg, NotificationType.APPOINTMENT,
                            "/doctor/appointments");
                }
            }
        }

        log.info("Finished AppointmentScheduler: {} appointments were auto-cancelled.", cancelledCount);
    }
}
