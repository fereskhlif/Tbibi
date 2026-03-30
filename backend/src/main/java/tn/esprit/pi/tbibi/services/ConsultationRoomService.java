package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.ConsultationRoomRequest;
import tn.esprit.pi.tbibi.DTO.ConsultationRoomResponse;
import tn.esprit.pi.tbibi.entities.ConsultationRoom;
import tn.esprit.pi.tbibi.entities.Teleconsultation;
import tn.esprit.pi.tbibi.repositories.ConsultationRoomRepo;
import tn.esprit.pi.tbibi.repositories.TeleconsultationRepo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultationRoomService implements IConsultationRoomService {

    private final ConsultationRoomRepo consultationRoomRepo;
    private final TeleconsultationRepo teleconsultationRepo;

    @Override
    public ConsultationRoomResponse create(ConsultationRoomRequest request) {
        Teleconsultation teleconsultation = teleconsultationRepo.findById(request.getTeleconsultationId())
                .orElseThrow(() -> new RuntimeException("Teleconsultation not found"));

        ConsultationRoom room = ConsultationRoom.builder()
                .roomCode(UUID.randomUUID().toString())
                .createdAt(LocalDateTime.now())
                .expiresAt(request.getExpiresAt())
                .teleconsultation(teleconsultation)
                .build();

        ConsultationRoom saved = consultationRoomRepo.save(room);
        
        teleconsultation.setConsultationRoom(saved);
        teleconsultationRepo.save(teleconsultation);
        
        return mapToResponse(saved);
    }

    @Override
    public ConsultationRoomResponse getById(Integer id) {
        ConsultationRoom room = consultationRoomRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation room not found"));
        return mapToResponse(room);
    }

    @Override
    public ConsultationRoomResponse getByRoomCode(String roomCode) {
        ConsultationRoom room = consultationRoomRepo.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Consultation room not found"));
        return mapToResponse(room);
    }

    @Override
    public List<ConsultationRoomResponse> getAll() {
        return consultationRoomRepo.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ConsultationRoomResponse update(Integer id, ConsultationRoomRequest request) {
        ConsultationRoom room = consultationRoomRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation room not found"));
        
        room.setExpiresAt(request.getExpiresAt());
        ConsultationRoom updated = consultationRoomRepo.save(room);
        return mapToResponse(updated);
    }

    @Override
    public void delete(Integer id) {
        consultationRoomRepo.deleteById(id);
    }

    private ConsultationRoomResponse mapToResponse(ConsultationRoom room) {
        return ConsultationRoomResponse.builder()
                .roomId(room.getRoomId())
                .roomCode(room.getRoomCode())
                .createdAt(room.getCreatedAt())
                .expiresAt(room.getExpiresAt())
                .build();
    }
}
