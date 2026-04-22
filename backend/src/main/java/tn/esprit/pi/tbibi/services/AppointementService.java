package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;
import tn.esprit.pi.tbibi.Mapper.IAppointementMapper;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.entities.NotificationType;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.StatusAppointement;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;
import tn.esprit.pi.tbibi.repositories.NotificationRepo;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointementService implements IAppointementService {

    private final AppointmentRepo appointmentRepository;
    private final ScheduleRepo scheduleRepository;
    private final UserRepo userRepo;
    private final IAppointementMapper mapper;
    private final NotificationRepo notificationRepo;
    private final VerificationService verificationService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Override
    public AppointmentResponse create(AppointmentRequest request) {
        System.out.println("DEBUG: Creating appointment. Request: " + request);
        Schedule schedule = findScheduleById(request.getScheduleId());
        schedule.setIsAvailable(false);
        scheduleRepository.save(schedule);

        Appointment appointment = mapper.toEntity(request);
        appointment.setSchedule(schedule);

        // Convert String status to enum safely
        if (request.getStatusAppointement() != null) {
            try {
                appointment.setStatusAppointement(
                        StatusAppointement.valueOf(request.getStatusAppointement().toUpperCase()));
            } catch (IllegalArgumentException e) {
                appointment.setStatusAppointement(StatusAppointement.PENDING);
            }
        } else {
            appointment.setStatusAppointement(StatusAppointement.PENDING);
        }

        if (request.getUserId() != null) {
            User patient = userRepo.findById(request.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.getUserId()));
            appointment.setUser(patient);
            // Set patientName directly so the doctor always sees the correct name
            if (appointment.getPatientName() == null || appointment.getPatientName().isBlank()) {
                appointment.setPatientName(patient.getName());
            }
        }

        Appointment saved = appointmentRepository.save(appointment);
        System.out.println("DEBUG: Appointment saved with ID: " + saved.getAppointmentId());

        // ── Notify the doctor ────────────────────────────────────────────────
        if (schedule.getDoctor() != null) {
            String patientName = saved.getUser() != null ? saved.getUser().getName() : "A patient";
            String specialty = saved.getSpecialty() != null ? saved.getSpecialty() : "a consultation";
            String msg = "New appointment request from " + patientName + " for " + specialty + ". Please accept or refuse.";

            // 1️⃣ Save to appointment notification table (for Doctor Notifications page accept/refuse)
            Notification notif = Notification.builder()
                    .message(msg)
                    .read(false)
                    .createdDate(LocalDateTime.now())
                    .appointments(saved)
                    .doctor(schedule.getDoctor())
                    .build();
            notificationRepo.save(notif);

            // 2️⃣ Also send via e-pharmacy notification system so it appears in the bell icon
            //    This saves to NotificationRepository and pushes proper JSON via WebSocket
            notificationService.createAndSend(
                    schedule.getDoctor(),
                    msg,
                    NotificationType.APPOINTMENT,
                    "/doctor/notifications"
            );
        }

        return mapper.toResponse(saved);
    }

    @Override
    public AppointmentResponse getById(Long id) {
        return mapper.toResponse(findAppointmentById(id));
    }

    @Override
    @Transactional
    public List<AppointmentResponse> getAll() {
        return mapper.toResponseList(appointmentRepository.findAll());
    }

    @Override
    @Transactional
    public List<AppointmentResponse> getByScheduleId(Long scheduleId) {
        return mapper.toResponseList(appointmentRepository.findByScheduleScheduleId(scheduleId));
    }

    @Override
    @Transactional
    public List<AppointmentResponse> getByUserId(Integer userId) {
        System.out.println("DEBUG: getByUserId called with userId=" + userId);
        List<Appointment> appointments = appointmentRepository.findByUserUserId(userId);
        System.out.println("DEBUG: found " + appointments.size() + " appointments for userId=" + userId);
        return mapper.toResponseList(appointments);
    }

    @Override
    @Transactional
    public List<AppointmentResponse> getByDoctorId(Integer doctorId) {
        return mapper.toResponseList(appointmentRepository.findByDoctorUserId(doctorId));
    }

    @Override
    public AppointmentResponse reschedule(Long appointmentId, Long newScheduleId) {
        Appointment appointment = findAppointmentById(appointmentId);
        Schedule newSchedule = findScheduleById(newScheduleId);

        // Free the old slot
        if (appointment.getSchedule() != null) {
            Schedule old = appointment.getSchedule();
            old.setIsAvailable(true);
            scheduleRepository.save(old);
        }

        // Book the new slot tentatively (doctor has proposed it)
        newSchedule.setIsAvailable(false);
        scheduleRepository.save(newSchedule);

        appointment.setSchedule(newSchedule);
        // Status = RESCHEDULED_PENDING: patient must accept or choose another slot
        appointment.setStatusAppointement(StatusAppointement.RESCHEDULED_PENDING);
        Appointment saved = appointmentRepository.save(appointment);

        // Notify patient via WebSocket + bell
        if (saved.getUser() != null) {
            String doctorName = (newSchedule.getDoctor() != null) ? newSchedule.getDoctor().getName() : "your doctor";
            String newDate = newSchedule.getDate() != null ? newSchedule.getDate().toString() : "";
            String newTime = newSchedule.getStartTime() != null ? newSchedule.getStartTime().toString().substring(0, 5) : "";
            String msg = "Dr. " + doctorName + " has proposed a new time for your " + saved.getSpecialty()
                    + " appointment: " + newDate + " at " + newTime
                    + ". Please accept or choose a different slot.";
            notificationService.createAndSend(saved.getUser(), msg, NotificationType.APPOINTMENT, "/patient/appointments");
        }

        return mapper.toResponse(saved);
    }

    /** Patient accepts the rescheduled appointment → CONFIRMED + email */
    @Override
    public AppointmentResponse acceptReschedule(Long appointmentId) {
        Appointment appointment = findAppointmentById(appointmentId);
        if (appointment.getStatusAppointement() != StatusAppointement.RESCHEDULED_PENDING) {
            throw new IllegalStateException("Appointment is not awaiting reschedule confirmation.");
        }
        appointment.setStatusAppointement(StatusAppointement.CONFIRMED);
        Appointment saved = appointmentRepository.save(appointment);

        // Send confirmation email
        String patientEmail = saved.getPatientEmail();
        if (patientEmail == null || patientEmail.isBlank()) {
            patientEmail = (saved.getUser() != null) ? saved.getUser().getEmail() : null;
        }
        if (patientEmail != null && !patientEmail.isBlank()) {
            try {
                Schedule schedule = saved.getSchedule();
                String dateStr = (schedule != null && schedule.getDate() != null)
                        ? schedule.getDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
                String timeStr = (schedule != null && schedule.getStartTime() != null)
                        ? schedule.getStartTime().toString().substring(0, 5) : "";
                String doctorName = (schedule != null && schedule.getDoctor() != null)
                        ? schedule.getDoctor().getName() : saved.getDoctor();
                String location = (schedule != null && schedule.getDoctor() != null
                        && schedule.getDoctor().getAdresse() != null)
                        ? schedule.getDoctor().getAdresse() : "";
                String patientName = saved.getPatientName() != null ? saved.getPatientName()
                        : (saved.getUser() != null ? saved.getUser().getName() : "Patient");
                String meetingLink = saved.getMeetingLink() != null ? saved.getMeetingLink() : "";
                emailService.sendAppointmentConfirmation(
                        patientEmail, patientName, doctorName,
                        saved.getSpecialty(), dateStr, timeStr, location, meetingLink);
            } catch (Exception e) {
                System.err.println("[ACCEPT_RESCHEDULE] Failed to send email: " + e.getMessage());
            }
        }
        
        // Notify doctor that patient accepted
        if (saved.getSchedule() != null && saved.getSchedule().getDoctor() != null) {
            String patientName = saved.getPatientName() != null ? saved.getPatientName()
                    : (saved.getUser() != null ? saved.getUser().getName() : "A patient");
            
            String msg = patientName + " has accepted the rescheduled appointment for " + saved.getSpecialty() + ".";
            
            Notification notif = Notification.builder()
                    .message(msg)
                    .read(false)
                    .createdDate(LocalDateTime.now())
                    .appointments(saved)
                    .doctor(saved.getSchedule().getDoctor())
                    .build();
            notificationRepo.save(notif);

            notificationService.createAndSend(
                    saved.getSchedule().getDoctor(),
                    msg,
                    NotificationType.APPOINTMENT,
                    "/doctor/notifications"
            );
        }

        return mapper.toResponse(saved);
    }

    /** Patient rejects the reschedule → old appointment CANCELLED, slot freed */
    @Override
    public AppointmentResponse rejectReschedule(Long appointmentId) {
        Appointment appointment = findAppointmentById(appointmentId);
        if (appointment.getStatusAppointement() != StatusAppointement.RESCHEDULED_PENDING) {
            throw new IllegalStateException("Appointment is not awaiting reschedule confirmation.");
        }
        // Free the proposed new slot
        if (appointment.getSchedule() != null) {
            Schedule proposed = appointment.getSchedule();
            proposed.setIsAvailable(true);
            scheduleRepository.save(proposed);
            
            // Notify doctor that patient rejected
            if (proposed.getDoctor() != null) {
                String patientName = appointment.getPatientName() != null ? appointment.getPatientName()
                        : (appointment.getUser() != null ? appointment.getUser().getName() : "A patient");
                String msg = patientName + " has requested a different time for their " + appointment.getSpecialty() + " appointment.";
                
                Notification notif = Notification.builder()
                        .message(msg)
                        .read(false)
                        .createdDate(LocalDateTime.now())
                        .appointments(appointment)
                        .doctor(proposed.getDoctor())
                        .build();
                notificationRepo.save(notif);

                notificationService.createAndSend(
                        proposed.getDoctor(),
                        msg,
                        NotificationType.APPOINTMENT,
                        "/doctor/notifications"
                );
            }
        }
        appointment.setStatusAppointement(StatusAppointement.CANCELLED);
        return mapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse update(Long id, AppointmentRequest request) {
        Appointment appointment = findAppointmentById(id);
        Schedule schedule = findScheduleById(request.getScheduleId());
        mapper.updateEntityFromRequest(request, appointment);
        appointment.setSchedule(schedule);
        if (request.getUserId() != null) {
            User patient = userRepo.findById(request.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.getUserId()));
            appointment.setUser(patient);
        }
        return mapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse updateStatus(Long id, StatusAppointement status) {
        Appointment appointment = findAppointmentById(id);
        // If cancelling, re-open the schedule slot
        if (status == StatusAppointement.CANCELLED && appointment.getSchedule() != null) {
            Schedule schedule = appointment.getSchedule();
            schedule.setIsAvailable(true);
            scheduleRepository.save(schedule);
        }
        appointment.setStatusAppointement(status);
        return mapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public void delete(Long id) {
        Appointment appointment = findAppointmentById(id);
        // Re-open the schedule slot so it becomes available again
        if (appointment.getSchedule() != null) {
            Schedule schedule = appointment.getSchedule();
            schedule.setIsAvailable(true);
            scheduleRepository.save(schedule);
        }
        appointmentRepository.deleteById(id);
    }

    private Appointment findAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + id));
    }

    private Schedule findScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + id));
    }

    /** Send SMS verification code for appointment booking */
    public String sendVerificationCode(tn.esprit.pi.tbibi.DTO.VerificationRequest request) {
        return verificationService.createVerification(request);
    }

    // ── JPQL query ────────────────────────────────────────────────────────────────
    /**
     * Specialty appointment breakdown for a doctor — backed by a JPQL JOIN query.
     * Converts raw Object[] rows to a list of maps { doctorName, specialty, count }.
     */
    @Override
    @Transactional
    public java.util.List<java.util.Map<String, Object>> getSpecialtyStats(Integer doctorId) {
        java.util.List<Object[]> rows = appointmentRepository.findSpecialtyStatsByDoctor(doctorId);
        java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (Object[] row : rows) {
            java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("doctorName",  row[0] != null ? row[0].toString() : "");
            map.put("specialty",   row[1] != null ? row[1].toString() : "");
            map.put("count",       row[2]);
            result.add(map);
        }
        return result;
    }

    // ── Keyword query ─────────────────────────────────────────────────────────────
    /**
     * Filtered appointments by date range + status + doctor — multi-table keyword query.
     * Touches: Appointment, Schedule, User(doctor).
     */
    @Override
    @Transactional
    public java.util.List<AppointmentResponse> getFilteredAppointments(
            Integer doctorId,
            java.time.LocalDate from,
            java.time.LocalDate to,
            tn.esprit.pi.tbibi.entities.StatusAppointement status) {
        java.util.List<Appointment> appts =
                appointmentRepository.findByScheduleDateBetweenAndStatusAppointementAndScheduleDoctorUserId(
                        from, to, status, doctorId);
        return mapper.toResponseList(appts);
    }

    /** Verify code and create appointment — email is sent later when doctor accepts */
    public AppointmentResponse verifyAndConfirm(String verificationId, String code) {
        var pv = verificationService.consume(verificationId, code);
        var req = pv.request();

        // Generate a unique meeting room per appointment
        String meetingLink = "https://meet.jit.si/tbibi-" + java.util.UUID.randomUUID();

        // Determine the correct patient userId
        Integer patientUserId = req.getUserId();
        String verifiedEmail = req.getPatientEmail();
        if ((patientUserId == null || patientUserId == 0) && verifiedEmail != null && !verifiedEmail.isBlank()) {
            patientUserId = userRepo.findByEmail(verifiedEmail)
                    .map(u -> u.getUserId())
                    .orElse(req.getUserId());
        }

        AppointmentRequest apptReq = AppointmentRequest.builder()
                .userId(patientUserId)
                .doctor(req.getDoctor())
                .service(req.getSpecialty())
                .specialty(req.getSpecialty())
                .reasonForVisit(req.getReasonForVisit())
                .statusAppointement("PENDING")
                .scheduleId(req.getScheduleId())
                .build();
        AppointmentResponse response = create(apptReq);

        // Persist the meeting link, patient name AND patient email on the saved appointment.
        final String patientNameFromForm = req.getPatientName() != null ? req.getPatientName() : "";
        final String patientEmailFromForm = req.getPatientEmail() != null ? req.getPatientEmail() : "";
        appointmentRepository.findById(response.getAppointmentId()).ifPresent(a -> {
            a.setMeetingLink(meetingLink);
            if (!patientNameFromForm.isBlank()) {
                a.setPatientName(patientNameFromForm);
            }
            // Always persist the patient email so we can send the confirmation later
            if (!patientEmailFromForm.isBlank()) {
                a.setPatientEmail(patientEmailFromForm);
            } else if (a.getUser() != null && a.getUser().getEmail() != null) {
                a.setPatientEmail(a.getUser().getEmail());
            }
            appointmentRepository.save(a);
            response.setPatientName(a.getPatientName());
        });

        // ✅ Email is intentionally NOT sent here.
        // The confirmation email with the meeting link will be sent when the doctor ACCEPTS the appointment.

        return response;
    }
}
