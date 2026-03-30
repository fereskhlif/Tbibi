package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.ConsultationRoom;

import java.util.Optional;

public interface ConsultationRoomRepo extends JpaRepository<ConsultationRoom, Integer> {
    Optional<ConsultationRoom> findByRoomCode(String roomCode);
}
