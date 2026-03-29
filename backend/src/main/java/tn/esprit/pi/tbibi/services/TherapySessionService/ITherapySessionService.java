package tn.esprit.pi.tbibi.services.TherapySessionService;

import tn.esprit.pi.tbibi.DTO.dtoTherapySession.PatientProgressDTO;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionRequest;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionResponse;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ITherapySessionService {

    TherapySessionResponse create(TherapySessionRequest request);
    TherapySessionResponse getById(Integer id);
    List<TherapySessionResponse> getAll();
    List<TherapySessionResponse> getByPatient(Integer patientId);
    List<TherapySessionResponse> getByPhysiotherapist(Integer physiotherapistId);
    List<TherapySessionResponse> getUpcomingSessions(Integer physiotherapistId);
    TherapySessionResponse update(Integer id, TherapySessionRequest request);
    TherapySessionResponse startSession(Integer id);
    TherapySessionResponse documentSession(Integer id, String exercisesPerformed, String sessionNotes);
    TherapySessionResponse completeSession(Integer id, TherapySessionRequest request);
    TherapySessionResponse cancelSession(Integer id);
    TherapySessionResponse rescheduleSession(Integer id, LocalDate newDate, LocalTime newStartTime, LocalTime newEndTime);
    void delete(Integer id);
    
    // Patient Progress
    List<PatientProgressDTO> getPatientProgressByPhysiotherapist(Integer physiotherapistId);
    PatientProgressDTO getPatientProgress(Integer patientId, Integer physiotherapistId);
}