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
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.StatusAppointement;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;
import tn.esprit.pi.tbibi.repositories.NotificationRepo;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import jakarta.mail.MessagingException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
            String msg = "New appointment request from " + patientName
                    + " for " + (saved.getSpecialty() != null ? saved.getSpecialty() : "a consultation")
                    + ". Please accept or refuse.";
            Notification notif = Notification.builder()
                    .message(msg)
                    .read(false)
                    .createdDate(LocalDateTime.now())
                    .appointments(saved)
                    .doctor(schedule.getDoctor())
                    .build();
            notificationRepo.save(notif);
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

        // Book the new slot
        newSchedule.setIsAvailable(false);
        scheduleRepository.save(newSchedule);

        appointment.setSchedule(newSchedule);
        appointment.setStatusAppointement(StatusAppointement.PENDING); // reset to pending
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

    /** Verify code and create appointment, then send confirmation email */
    public AppointmentResponse verifyAndConfirm(String verificationId, String code) {
        var pv = verificationService.consume(verificationId, code);
        var req = pv.request();

        // Generate a unique meeting room per appointment
        String meetingLink = "https://meet.jit.si/tbibi-" + java.util.UUID.randomUUID();

        // Determine the correct patient userId: respect the logged-in user ID passed by the frontend.
        // Fallback to finding by verified email only if the frontend sent a null or 0 userId.
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

        // Persist the meeting link AND the patient name (from the form) on the saved appointment.
        // Storing patientName directly ensures the doctor always sees the right name even if
        // the userId was incorrectly linked.
        final String patientNameFromForm = req.getPatientName() != null ? req.getPatientName() : "";
        appointmentRepository.findById(response.getAppointmentId()).ifPresent(a -> {
            a.setMeetingLink(meetingLink);
            if (!patientNameFromForm.isBlank()) {
                a.setPatientName(patientNameFromForm);
            }
            appointmentRepository.save(a);
            // Update the response to reflect the correct patientName
            response.setPatientName(a.getPatientName());
        });

        Schedule schedule = findScheduleById(req.getScheduleId());
        String patientEmail = req.getPatientEmail();
        if ((patientEmail == null || patientEmail.isBlank()) && req.getUserId() != null) {
            patientEmail = userRepo.findById(req.getUserId()).map(User::getEmail).orElse(null);
        }
        if (patientEmail != null && !patientEmail.isBlank()) {
            try {
                String dateStr = schedule.getDate() != null ? schedule.getDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
                String timeStr = schedule.getStartTime() != null ? schedule.getStartTime().toString().substring(0, 5) : "";
                String location = schedule.getDoctor() != null && schedule.getDoctor().getAdresse() != null ? schedule.getDoctor().getAdresse() : "";
                emailService.sendAppointmentConfirmation(
                        patientEmail,
                        req.getPatientName() != null ? req.getPatientName() : "Patient",
                        req.getDoctor(),
                        req.getSpecialty(),
                        dateStr,
                        timeStr,
                        location,
                        meetingLink);
            } catch (MessagingException e) {
                // Log but don't fail - appointment is already created
                System.err.println("Failed to send confirmation email: " + e.getMessage());
            }
        }
        return response;
    }
}
