package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;
import tn.esprit.pi.tbibi.entities.StatusAppointement;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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

    /** Patient accepts the rescheduled slot → CONFIRMED + confirmation email */
    AppointmentResponse acceptReschedule(Long appointmentId);

    /** Patient rejects the rescheduled slot → CANCELLED, slot freed */
    AppointmentResponse rejectReschedule(Long appointmentId);

    void delete(Long id);

    // ── JPQL query ─────────────────────────────────────────
    /**
     * Specialty appointment count breakdown for a doctor.
     * Returns a list of maps: [{doctorName, specialty, count}]
     */
    List<Map<String, Object>> getSpecialtyStats(Integer doctorId);

    // ── Keyword query ───────────────────────────────────
    /**
     * Appointments filtered by date range + status + doctor (multi-table keyword query).
     */
    List<AppointmentResponse> getFilteredAppointments(
            Integer doctorId,
            LocalDate from,
            LocalDate to,
            StatusAppointement status);
}
