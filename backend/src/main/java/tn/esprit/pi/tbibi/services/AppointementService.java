package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
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
    public List<AppointmentResponse> getAll() {
        return mapper.toResponseList(appointmentRepository.findAll());
    }

    @Override
    public List<AppointmentResponse> getByScheduleId(Long scheduleId) {
        return mapper.toResponseList(appointmentRepository.findByScheduleScheduleId(scheduleId));
    }

    @Override
    public List<AppointmentResponse> getByUserId(Integer userId) {
        return mapper.toResponseList(appointmentRepository.findByUserUserId(userId));
    }

    @Override
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
            Integer userId = request.getUserId().intValue();
            User patient = userRepo.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
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
}
