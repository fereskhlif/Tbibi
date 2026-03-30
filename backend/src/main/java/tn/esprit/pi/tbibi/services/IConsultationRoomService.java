package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.ConsultationRoomRequest;
import tn.esprit.pi.tbibi.DTO.ConsultationRoomResponse;

import java.util.List;

public interface IConsultationRoomService {
    ConsultationRoomResponse create(ConsultationRoomRequest request);

    ConsultationRoomResponse getById(Integer id);

    ConsultationRoomResponse getByRoomCode(String roomCode);

    List<ConsultationRoomResponse> getAll();

    ConsultationRoomResponse update(Integer id, ConsultationRoomRequest request);

    void delete(Integer id);
}
