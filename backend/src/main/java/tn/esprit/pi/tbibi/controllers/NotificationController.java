package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.NotificationDTO;
import tn.esprit.pi.tbibi.DTO.notification.NotificationResponse;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.entities.NotificationType;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.StatusAppointement;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;
import tn.esprit.pi.tbibi.repositories.NotificationRepo;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;
import tn.esprit.pi.tbibi.services.EmailService;
import tn.esprit.pi.tbibi.services.NotificationService;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepo notificationRepo;
    private final AppointmentRepo appointmentRepo;
    private final ScheduleRepo scheduleRepo;
    private final NotificationService notificationService;
    private final EmailService emailService;

    // ── e-pharmacy endpoints ──────────────────────────────────────────────────

    @GetMapping("/user/{userId}")
    public List<NotificationResponse> getForUser(@PathVariable("userId") Integer userId) {
        return notificationService.getForUser(userId);
    }

    @GetMapping("/unread-count/{userId}")
    public long getUnreadCount(@PathVariable("userId") Integer userId) {
        return notificationService.getUnreadCount(userId);
    }

    @PutMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable("id") Long id) {
        return notificationService.markAsRead(id);
    }

    @PutMapping("/read-all/{userId}")
    public void markAllAsRead(@PathVariable("userId") Integer userId) {
        notificationService.markAllAsRead(userId);
    }

    // ── Doctor / Appointment endpoints ───────────────────────────────────────

    @GetMapping("/doctor/{doctorId}")
    @Transactional
    public ResponseEntity<List<NotificationDTO>> getForDoctor(@PathVariable int doctorId) {
        List<Notification> notifs = notificationRepo.findByDoctorUserIdOrderByCreatedDateDesc(doctorId);
        List<NotificationDTO> dtos = notifs.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/doctor/{doctorId}/unread-count")
    public ResponseEntity<Long> getDoctorUnreadCount(@PathVariable int doctorId) {
        return ResponseEntity.ok(notificationRepo.countByDoctorUserIdAndRead(doctorId, false));
    }

    @PatchMapping("/{id}/accept")
    @Transactional
    public ResponseEntity<NotificationDTO> accept(@PathVariable Long id) {
        Notification notif = notificationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));

        Appointment apt = notif.getAppointments();
        System.out.println("[ACCEPT] apt=" + (apt != null ? apt.getAppointmentId() : "NULL"));

        if (apt != null) {
            apt.setStatusAppointement(StatusAppointement.CONFIRMED);
            appointmentRepo.save(apt);

            String doctorName = (notif.getDoctor() != null) ? notif.getDoctor().getName() : "your doctor";

            // ── Notify patient via WebSocket ────────────────────────────────
            if (apt.getUser() != null) {
                String msg = "Your appointment for " + apt.getSpecialty() + " has been confirmed by Dr. " + doctorName + ".";
                notificationService.createAndSend(apt.getUser(), msg, NotificationType.APPOINTMENT, "/patient/appointments");
            }

            // ── Send confirmation email ────────────────────────────────────────
            // Re-fetch appointment eagerly so lazy relations are loaded in transaction
            Appointment freshApt = appointmentRepo.findById(apt.getAppointmentId())
                    .orElse(apt);

            String patientEmail = freshApt.getUser() != null ? freshApt.getUser().getEmail() : null;
            System.out.println("[ACCEPT] patientEmail=" + patientEmail);

            if (patientEmail != null && !patientEmail.isBlank()) {
                try {
                    Schedule schedule = freshApt.getSchedule();
                    String dateStr = (schedule != null && schedule.getDate() != null)
                            ? schedule.getDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
                    String timeStr = (schedule != null && schedule.getStartTime() != null)
                            ? schedule.getStartTime().toString().substring(0, 5) : "";
                    String location = (notif.getDoctor() != null && notif.getDoctor().getAdresse() != null)
                            ? notif.getDoctor().getAdresse() : "";
                    String meetingLink = freshApt.getMeetingLink() != null ? freshApt.getMeetingLink() : "";
                    String patientName = freshApt.getPatientName() != null
                            ? freshApt.getPatientName()
                            : (freshApt.getUser() != null ? freshApt.getUser().getName() : "Patient");

                    System.out.println("[ACCEPT] Sending email to " + patientEmail +
                            " | doctor=" + doctorName +
                            " | date=" + dateStr +
                            " | time=" + timeStr +
                            " | meetingLink=" + meetingLink);

                    emailService.sendAppointmentConfirmation(
                            patientEmail,
                            patientName,
                            doctorName,
                            freshApt.getSpecialty(),
                            dateStr,
                            timeStr,
                            location,
                            meetingLink);

                    System.out.println("[ACCEPT] Email sent successfully to " + patientEmail);
                } catch (Exception e) {
                    System.err.println("[ACCEPT] Failed to send confirmation email: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.err.println("[ACCEPT] Cannot send email — patient has no email address or user is null.");
            }
        }
        notif.setRead(true);
        notificationRepo.save(notif);
        return ResponseEntity.ok(toDTO(notif));
    }

    @PatchMapping("/{id}/refuse")
    @Transactional
    public ResponseEntity<NotificationDTO> refuse(@PathVariable Long id) {
        Notification notif = notificationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));

        Appointment apt = notif.getAppointments();
        if (apt != null) {
            apt.setStatusAppointement(StatusAppointement.CANCELLED);
            appointmentRepo.save(apt);
            Schedule schedule = apt.getSchedule();
            if (schedule != null) {
                schedule.setIsAvailable(true);
                scheduleRepo.save(schedule);
            }
            
            // Notify patient that appointment is refused
            if (apt.getUser() != null) {
                String doctorName = (notif.getDoctor() != null) ? notif.getDoctor().getName() : "your doctor";
                String msg = "Your appointment for " + apt.getSpecialty() + " has been declined by Dr. " + doctorName + ".";
                notificationService.createAndSend(apt.getUser(), msg, NotificationType.APPOINTMENT, "/patient/appointments");
            }
        }
        notif.setRead(true);
        notificationRepo.save(notif);
        return ResponseEntity.ok(toDTO(notif));
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = NotificationDTO.builder()
                .notificationId(n.getNotificationId())
                .message(n.getMessage())
                .read(n.isRead())
                .createdDate(n.getCreatedDate())
                .doctorId(n.getDoctor() != null ? n.getDoctor().getUserId() : 0)
                .build();

        Appointment apt = n.getAppointments();
        if (apt != null) {
            dto.setAppointmentId(apt.getAppointmentId());
            dto.setSpecialty(apt.getSpecialty());
            dto.setReasonForVisit(apt.getReasonForVisit());
            dto.setStatusAppointement(
                    apt.getStatusAppointement() != null ? apt.getStatusAppointement().name() : null);
            dto.setPatientName(apt.getUser() != null ? apt.getUser().getName() : "Unknown");

            Schedule schedule = apt.getSchedule();
            if (schedule != null) {
                dto.setScheduleDate(schedule.getDate() != null ? schedule.getDate().toString() : null);
                dto.setScheduleTime(schedule.getStartTime() != null ? schedule.getStartTime().toString() : null);
            }
        }
        return dto;
    }
}