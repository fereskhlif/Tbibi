package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.NotificationDTO;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.StatusAppointement;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;
import tn.esprit.pi.tbibi.repositories.NotificationRepo;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepo notificationRepo;
    private final AppointmentRepo appointmentRepo;
    private final ScheduleRepo scheduleRepo;

    /** Get all notifications for a doctor */
    @GetMapping("/doctor/{doctorId}")
    @Transactional
    public ResponseEntity<List<NotificationDTO>> getForDoctor(@PathVariable int doctorId) {
        List<Notification> notifs = notificationRepo.findByDoctorUserIdOrderByCreatedDateDesc(doctorId);
        List<NotificationDTO> dtos = notifs.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /** Count unread notifications for a doctor */
    @GetMapping("/doctor/{doctorId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable int doctorId) {
        return ResponseEntity.ok(notificationRepo.countByDoctorUserIdAndRead(doctorId, false));
    }

    /** Mark a notification as read */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationRepo.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepo.save(n);
        });
        return ResponseEntity.noContent().build();
    }

    /** Accept the appointment linked to a notification → status = CONFIRMED */
    @PatchMapping("/{id}/accept")
    @Transactional
    public ResponseEntity<NotificationDTO> accept(@PathVariable Long id) {
        Notification notif = notificationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));

        Appointment apt = notif.getAppointments();
        if (apt != null) {
            apt.setStatusAppointement(StatusAppointement.CONFIRMED);
            appointmentRepo.save(apt);
        }
        notif.setRead(true);
        notificationRepo.save(notif);
        return ResponseEntity.ok(toDTO(notif));
    }

    /** Refuse the appointment → status = CANCELLED, re-open schedule slot */
    @PatchMapping("/{id}/refuse")
    @Transactional
    public ResponseEntity<NotificationDTO> refuse(@PathVariable Long id) {
        Notification notif = notificationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));

        Appointment apt = notif.getAppointments();
        if (apt != null) {
            apt.setStatusAppointement(StatusAppointement.CANCELLED);
            appointmentRepo.save(apt);
            // Free up the schedule slot
            Schedule schedule = apt.getSchedule();
            if (schedule != null) {
                schedule.setIsAvailable(true);
                scheduleRepo.save(schedule);
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
