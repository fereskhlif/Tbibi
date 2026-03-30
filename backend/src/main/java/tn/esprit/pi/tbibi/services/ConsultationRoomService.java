package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.ConsultationRoomRequest;
import tn.esprit.pi.tbibi.DTO.ConsultationRoomResponse;
import tn.esprit.pi.tbibi.Mapper.IAppointementMapper;
import tn.esprit.pi.tbibi.entities.ConsultationRoom;
import tn.esprit.pi.tbibi.entities.Teleconsultation;
import tn.esprit.pi.tbibi.repositories.ConsultationRoomRepo;
import tn.esprit.pi.tbibi.repositories.TeleconsultationRepo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationRoomService implements IConsultationRoomService {

    private final ConsultationRoomRepo consultationRoomRepo;
    private final TeleconsultationRepo teleconsultationRepo;
    private final IAppointementMapper mapper;

    @Override
    public ConsultationRoomResponse create(ConsultationRoomRequest request) {
        ConsultationRoom room = mapper.toConsultationRoomEntity(request);

        // Auto-generate a unique short room code
        String roomCode = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        room.setRoomCode(roomCode);
        room.setCreatedAt(LocalDateTime.now());

        ConsultationRoom saved = consultationRoomRepo.save(room);

        // Link room back to the teleconsultation
        if (request.getTeleconsultationId() != null) {
            Teleconsultation teleconsultation = teleconsultationRepo.findById(request.getTeleconsultationId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Teleconsultation not found with id: " + request.getTeleconsultationId()));
            teleconsultation.setConsultationRoom(saved);
            teleconsultationRepo.save(teleconsultation);
        }

        return mapper.toConsultationRoomResponse(saved);
    }

    @Override
    public ConsultationRoomResponse getById(Integer id) {
        return mapper.toConsultationRoomResponse(findById(id));
    }

    @Override
    public ConsultationRoomResponse getByRoomCode(String roomCode) {
        return consultationRoomRepo.findByRoomCode(roomCode)
                .map(mapper::toConsultationRoomResponse)
                .orElseThrow(() -> new EntityNotFoundException(
                        "ConsultationRoom not found with code: " + roomCode));
    }

    @Override
    public List<ConsultationRoomResponse> getAll() {
        return mapper.toConsultationRoomResponseList(consultationRoomRepo.findAll());
    }

    @Override
    public ConsultationRoomResponse update(Integer id, ConsultationRoomRequest request) {
        ConsultationRoom room = findById(id);
        room.setExpiresAt(request.getExpiresAt());
        return mapper.toConsultationRoomResponse(consultationRoomRepo.save(room));
    }

    @Override
    public void delete(Integer id) {
        findById(id);
        consultationRoomRepo.deleteById(id);
    }

    private ConsultationRoom findById(Integer id) {
        return consultationRoomRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "ConsultationRoom not found with id: " + id));
    }
}
