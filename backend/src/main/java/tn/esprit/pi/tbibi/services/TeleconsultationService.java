package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.TeleconsultationRequest;
import tn.esprit.pi.tbibi.DTO.TeleconsultationResponse;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.Teleconsultation;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;
import tn.esprit.pi.tbibi.repositories.TeleconsultationRepo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeleconsultationService implements ITeleconsultationService {

    private final TeleconsultationRepo teleconsultationRepo;
    private final AppointmentRepo appointmentRepo;

    @Override
    public TeleconsultationResponse create(TeleconsultationRequest request) {
        Appointment appointment = appointmentRepo.findById(request.getAppointmentId().intValue())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Teleconsultation teleconsultation = Teleconsultation.builder()
                .appointment(appointment)
                .notes(request.getNotes())
                .startDateTime(LocalDateTime.now())
                .build();

        Teleconsultation saved = teleconsultationRepo.save(teleconsultation);
        return mapToResponse(saved);
    }

    @Override
    public TeleconsultationResponse getById(Integer id) {
        Teleconsultation teleconsultation = teleconsultationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Teleconsultation not found"));
        return mapToResponse(teleconsultation);
    }

    @Override
    public TeleconsultationResponse getByAppointmentId(Long appointmentId) {
        Teleconsultation teleconsultation = teleconsultationRepo.findByAppointmentAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Teleconsultation not found"));
        return mapToResponse(teleconsultation);
    }

    @Override
    public List<TeleconsultationResponse> getAll() {
        return teleconsultationRepo.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TeleconsultationResponse update(Integer id, TeleconsultationRequest request) {
        Teleconsultation teleconsultation = teleconsultationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Teleconsultation not found"));
        
        teleconsultation.setNotes(request.getNotes());
        Teleconsultation updated = teleconsultationRepo.save(teleconsultation);
        return mapToResponse(updated);
    }

    @Override
    public void delete(Integer id) {
        teleconsultationRepo.deleteById(id);
    }

    private TeleconsultationResponse mapToResponse(Teleconsultation teleconsultation) {
        return TeleconsultationResponse.builder()
                .id(teleconsultation.getId())
                .appointmentId(teleconsultation.getAppointment() != null ? 
                        teleconsultation.getAppointment().getAppointmentId() : null)
                .roomUrl(teleconsultation.getRoomUrl())
                .startDateTime(teleconsultation.getStartDateTime())
                .endDateTime(teleconsultation.getEndDateTime())
                .notes(teleconsultation.getNotes())
                .roomId(teleconsultation.getConsultationRoom() != null ? 
                        teleconsultation.getConsultationRoom().getRoomId() : null)
                .roomCode(teleconsultation.getConsultationRoom() != null ? 
                        teleconsultation.getConsultationRoom().getRoomCode() : null)
                .build();
    }
}
