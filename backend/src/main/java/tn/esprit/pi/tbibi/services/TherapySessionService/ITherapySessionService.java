package tn.esprit.pi.tbibi.services.TherapySessionService;

import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionRequest;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionResponse;
import java.util.List;

public interface ITherapySessionService {

    TherapySessionResponse create(TherapySessionRequest request);
    TherapySessionResponse getById(Integer id);
    List<TherapySessionResponse> getAll();
    List<TherapySessionResponse> getByPatient(Integer patientId);
    List<TherapySessionResponse> getByPhysiotherapist(Integer physiotherapistId);
    TherapySessionResponse update(Integer id, TherapySessionRequest request);
    void delete(Integer id);
}