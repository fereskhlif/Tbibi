package tn.esprit.pi.tbibi.services;

import jakarta.mail.MessagingException;
import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;
import tn.esprit.pi.tbibi.entities.StatusAppointement;

import java.util.List;

public interface IAppointementService {
    AppointmentResponse create(AppointmentRequest request);

    AppointmentResponse getById(Long id);

    List<AppointmentResponse> getAll();

    List<AppointmentResponse> getByScheduleId(Long scheduleId);

    List<AppointmentResponse> getByUserId(Integer userId);


    /**
     * Get all appointments assigned to a doctor (by their user ID via the schedule)
     */
    List<AppointmentResponse> getByDoctorId(Integer doctorId);

    AppointmentResponse update(Long id, AppointmentRequest request);

    AppointmentResponse updateStatus(Long id, StatusAppointement status);

    /** Reschedule an appointment to a new schedule slot */
    AppointmentResponse reschedule(Long appointmentId, Long newScheduleId);

    void delete(Long id);
}
