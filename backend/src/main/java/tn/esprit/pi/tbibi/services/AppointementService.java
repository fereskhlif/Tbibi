package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;
import tn.esprit.pi.tbibi.Mapper.IAppointementMapper;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointementService implements IAppointementService {

    private final AppointmentRepo appointmentRepository;
    private final ScheduleRepo scheduleRepository;
    private final IAppointementMapper mapper;

    @Override
    public AppointmentResponse create(AppointmentRequest request) {
        // 1. Fetch schedule from DB
        Schedule schedule = findScheduleById(Math.toIntExact(request.getScheduleId()));

        // 2. Map request DTO → entity via mapper
        Appointment appointment = mapper.toEntity(request);

        // 3. Inject the schedule (mapper cannot do DB lookups)
        appointment.setSchedule(schedule);

        // 4. Persist and map entity → response DTO
        return mapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse getById(Integer id) {
        return mapper.toResponse(findAppointmentById(id));
    }

    // ── READ ALL ─────────────────────────────────────────────────────────────

    @Override
    public List<AppointmentResponse> getAll() {
        return mapper.toResponseList(appointmentRepository.findAll());
    }

    // ── READ BY SCHEDULE ─────────────────────────────────────────────────────

    @Override
    public List<AppointmentResponse> getByScheduleId(Integer scheduleId) {
        return mapper.toResponseList(
                appointmentRepository.findByScheduleScheduleId(scheduleId)
        );
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────

    @Override
    public AppointmentResponse update(Integer id, AppointmentRequest request) {
        // 1. Fetch existing entity
        Appointment appointment = findAppointmentById(id);

        // 2. Fetch updated schedule
        Schedule schedule = findScheduleById(Math.toIntExact(request.getScheduleId()));

        // 3. Apply changes via mapper (in-place update)
        mapper.updateEntityFromRequest(request, appointment);

        // 4. Update schedule reference
        appointment.setSchedule(schedule);

        // 5. Persist and map to response
        return mapper.toResponse(appointmentRepository.save(appointment));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    @Override
    public void delete(Integer id) {
        findAppointmentById(id); // will throw if not found
        appointmentRepository.deleteById(id);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Appointment findAppointmentById(Integer id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found with id: " + id));
    }

    private Schedule findScheduleById(Integer id) {
        return scheduleRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new EntityNotFoundException(
                        "Schedule not found with id: " + id));
    }
    }
