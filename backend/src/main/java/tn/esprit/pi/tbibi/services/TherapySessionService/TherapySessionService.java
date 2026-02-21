package tn.esprit.pi.tbibi.services.TherapySessionService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionRequest;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionResponse;
import tn.esprit.pi.tbibi.entities.TherapySession;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.TherapySessionMapper;
import tn.esprit.pi.tbibi.repositories.TherapySessionRepository;
import tn.esprit.pi.tbibi.repositories.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TherapySessionService implements ITherapySessionService {

    private final TherapySessionRepository sessionRepo;
    private final UserRepository userRepo;
    private final TherapySessionMapper mapper;

    @Override
    public TherapySessionResponse create(TherapySessionRequest request) {
        User patient = userRepo.findById(request.getPatientId()).get();
        User physio = userRepo.findById(request.getPhysiotherapistId()).get();
        TherapySession session = mapper.toEntity(request);
        session.setPatient(patient);
        session.setPhysiotherapist(physio);
        return mapper.toResponse(sessionRepo.save(session));
    }

    @Override
    public TherapySessionResponse getById(Integer id) {
        TherapySession session = sessionRepo.findById(id).get();
        return mapper.toResponse(session);
    }

    @Override
    public List<TherapySessionResponse> getAll() {
        return sessionRepo.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TherapySessionResponse> getByPatient(Integer patientId) {
        return sessionRepo.findByPatient_UserId(patientId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TherapySessionResponse> getByPhysiotherapist(Integer physiotherapistId) {
        return sessionRepo.findByPhysiotherapist_UserId(physiotherapistId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TherapySessionResponse update(Integer id, TherapySessionRequest request) {
        TherapySession session = sessionRepo.findById(id).get();
        session.setProgressNote(request.getProgressNote());
        session.setScheduledDate(request.getScheduledDate());
        session.setEvaluationResult(request.getEvaluationResult());
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        return mapper.toResponse(sessionRepo.save(session));
    }

    @Override
    public void delete(Integer id) {
        sessionRepo.deleteById(id);
    }
}