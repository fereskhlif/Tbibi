package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.TeleconsultationRequest;
import tn.esprit.pi.tbibi.DTO.TeleconsultationResponse;
import tn.esprit.pi.tbibi.Mapper.IAppointementMapper;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.Teleconsultation;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;
import tn.esprit.pi.tbibi.repositories.TeleconsultationRepo;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeleconsultationService implements ITeleconsultationService {

    private final TeleconsultationRepo teleconsultationRepo;
    private final AppointmentRepo appointmentRepo;
    private final IAppointementMapper mapper;

    @Override
    public TeleconsultationResponse create(TeleconsultationRequest request) {
        Appointment appointment = appointmentRepo.findById(request.getAppointmentId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found with id: " + request.getAppointmentId()));

        Teleconsultation teleconsultation = mapper.toTeleconsultationEntity(request);
        teleconsultation.setAppointment(appointment);

        // Derive startDateTime from the linked schedule
        Schedule schedule = appointment.getSchedule();
        if (schedule != null && schedule.getDate() != null && schedule.getStartTime() != null) {
            teleconsultation.setStartDateTime(
                    LocalDateTime.of(schedule.getDate(), schedule.getStartTime()));
        } else {
            teleconsultation.setStartDateTime(LocalDateTime.now());
        }

        return mapper.toTeleconsultationResponse(teleconsultationRepo.save(teleconsultation));
    }

    @Override
    public TeleconsultationResponse getById(Integer id) {
        return mapper.toTeleconsultationResponse(findById(id));
    }

    @Override
    public TeleconsultationResponse getByAppointmentId(Long appointmentId) {
        return teleconsultationRepo.findByAppointmentAppointmentId(appointmentId)
                .map(mapper::toTeleconsultationResponse)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Teleconsultation not found for appointment id: " + appointmentId));
    }

    @Override
    public List<TeleconsultationResponse> getAll() {
        return mapper.toTeleconsultationResponseList(teleconsultationRepo.findAll());
    }

    @Override
    public TeleconsultationResponse update(Integer id, TeleconsultationRequest request) {
        Teleconsultation teleconsultation = findById(id);
        teleconsultation.setNotes(request.getNotes());
        return mapper.toTeleconsultationResponse(teleconsultationRepo.save(teleconsultation));
    }

    @Override
    public void delete(Integer id) {
        findById(id);
        teleconsultationRepo.deleteById(id);
    }

    private Teleconsultation findById(Integer id) {
        return teleconsultationRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Teleconsultation not found with id: " + id));
    }
}
