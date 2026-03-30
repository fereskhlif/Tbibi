package tn.esprit.pi.tbibi.services.TherapySessionService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.PatientProgressDTO;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionRequest;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionResponse;
import tn.esprit.pi.tbibi.entities.TherapySession;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.TherapySessionMapper;
import tn.esprit.pi.tbibi.repositories.TherapySessionRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TherapySessionService implements ITherapySessionService {

    private final TherapySessionRepository sessionRepo;
    private final UserRepo userRepo;
    private final TherapySessionMapper mapper;

    @Override
    public TherapySessionResponse create(TherapySessionRequest request) {
        User patient = userRepo.findById((long) request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + request.getPatientId()));
        User physio = userRepo.findById((long) request.getPhysiotherapistId())
                .orElseThrow(() -> new RuntimeException("Physiotherapist not found with id: " + request.getPhysiotherapistId()));
        TherapySession session = mapper.toEntity(request);
        session.setPatient(patient);
        session.setPhysiotherapist(physio);
        if (session.getStatus() == null || session.getStatus().isEmpty()) {
            session.setStatus("Scheduled");
        }
        return mapper.toResponse(sessionRepo.save(session));
    }

    @Override
    public TherapySessionResponse getById(Integer id) {
        TherapySession session = sessionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Therapy session not found with id: " + id));
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
    public List<TherapySessionResponse> getUpcomingSessions(Integer physiotherapistId) {
        LocalDate today = LocalDate.now();
        return sessionRepo.findByPhysiotherapist_UserId(physiotherapistId)
                .stream()
                .filter(session -> !session.getStatus().equals("Completed") && 
                                   !session.getStatus().equals("Cancelled") &&
                                   (session.getScheduledDate().isAfter(today) || 
                                    session.getScheduledDate().isEqual(today)))
                .sorted((s1, s2) -> {
                    int dateCompare = s1.getScheduledDate().compareTo(s2.getScheduledDate());
                    if (dateCompare != 0) return dateCompare;
                    return s1.getStartTime().compareTo(s2.getStartTime());
                })
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TherapySessionResponse update(Integer id, TherapySessionRequest request) {
        TherapySession session = sessionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Therapy session not found with id: " + id));
        
        if (request.getTherapyType() != null) session.setTherapyType(request.getTherapyType());
        if (request.getProgressNote() != null) session.setProgressNote(request.getProgressNote());
        if (request.getScheduledDate() != null) session.setScheduledDate(request.getScheduledDate());
        if (request.getEvaluationResult() != null) session.setEvaluationResult(request.getEvaluationResult());
        if (request.getStartTime() != null) session.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) session.setEndTime(request.getEndTime());
        if (request.getDurationMinutes() != null) session.setDurationMinutes(request.getDurationMinutes());
        if (request.getStatus() != null) session.setStatus(request.getStatus());
        
        return mapper.toResponse(sessionRepo.save(session));
    }

    @Override
    public TherapySessionResponse startSession(Integer id) {
        TherapySession session = sessionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Therapy session not found with id: " + id));
        session.setStatus("In Progress");
        session.setActualStartTime(LocalTime.now());
        return mapper.toResponse(sessionRepo.save(session));
    }

    @Override
    public TherapySessionResponse documentSession(Integer id, String exercisesPerformed, String sessionNotes) {
        TherapySession session = sessionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Therapy session not found with id: " + id));
        
        if (!"In Progress".equals(session.getStatus())) {
            throw new RuntimeException("Can only document sessions that are in progress");
        }
        
        session.setExercisesPerformed(exercisesPerformed);
        session.setSessionNotes(sessionNotes);
        return mapper.toResponse(sessionRepo.save(session));
    }

    @Override
    public TherapySessionResponse completeSession(Integer id, TherapySessionRequest request) {
        TherapySession session = sessionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Therapy session not found with id: " + id));
        
        session.setStatus("Completed");
        session.setActualEndTime(LocalTime.now());
        
        // Calculer la durée réelle si l'heure de début est définie
        if (session.getActualStartTime() != null && session.getActualEndTime() != null) {
            long minutes = java.time.Duration.between(session.getActualStartTime(), session.getActualEndTime()).toMinutes();
            session.setActualDurationMinutes((int) minutes);
        }
        
        if (request.getProgressNote() != null) {
            session.setProgressNote(request.getProgressNote());
        }
        if (request.getEvaluationResult() != null) {
            session.setEvaluationResult(request.getEvaluationResult());
        }
        if (request.getExercisesPerformed() != null) {
            session.setExercisesPerformed(request.getExercisesPerformed());
        }
        if (request.getSessionNotes() != null) {
            session.setSessionNotes(request.getSessionNotes());
        }
        
        return mapper.toResponse(sessionRepo.save(session));
    }

    @Override
    public TherapySessionResponse cancelSession(Integer id) {
        TherapySession session = sessionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Therapy session not found with id: " + id));
        session.setStatus("Cancelled");
        return mapper.toResponse(sessionRepo.save(session));
    }

    @Override
    public TherapySessionResponse rescheduleSession(Integer id, LocalDate newDate, LocalTime newStartTime, LocalTime newEndTime) {
        TherapySession session = sessionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Therapy session not found with id: " + id));
        session.setScheduledDate(newDate);
        session.setStartTime(newStartTime);
        session.setEndTime(newEndTime);
        session.setStatus("Rescheduled");
        return mapper.toResponse(sessionRepo.save(session));
    }

    @Override
    public void delete(Integer id) {
        sessionRepo.deleteById(id);
    }

    @Override
    public List<PatientProgressDTO> getPatientProgressByPhysiotherapist(Integer physiotherapistId) {
        List<TherapySession> allSessions = sessionRepo.findByPhysiotherapist_UserId(physiotherapistId);
        
        // Grouper par patient
        Map<Integer, List<TherapySession>> sessionsByPatient = allSessions.stream()
                .collect(Collectors.groupingBy(session -> session.getPatient().getUserId()));
        
        // Créer un DTO pour chaque patient
        return sessionsByPatient.entrySet().stream()
                .map(entry -> buildPatientProgressDTO(entry.getKey(), entry.getValue()))
                .sorted((p1, p2) -> p2.getProgressPercentage().compareTo(p1.getProgressPercentage()))
                .collect(Collectors.toList());
    }

    @Override
    public PatientProgressDTO getPatientProgress(Integer patientId, Integer physiotherapistId) {
        List<TherapySession> sessions = sessionRepo.findByPhysiotherapist_UserId(physiotherapistId)
                .stream()
                .filter(s -> s.getPatient().getUserId() == patientId)
                .collect(Collectors.toList());
        
        return buildPatientProgressDTO(patientId, sessions);
    }

    private PatientProgressDTO buildPatientProgressDTO(Integer patientId, List<TherapySession> sessions) {
        User patient = userRepo.findById((long) patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        // Calculer les statistiques
        long totalSessions = sessions.size();
        long completedSessions = sessions.stream()
                .filter(s -> "Completed".equals(s.getStatus()))
                .count();
        long scheduledSessions = sessions.stream()
                .filter(s -> "Scheduled".equals(s.getStatus()) || "Rescheduled".equals(s.getStatus()))
                .count();
        long cancelledSessions = sessions.stream()
                .filter(s -> "Cancelled".equals(s.getStatus()))
                .count();
        
        // Calculer le pourcentage de progression
        double progressPercentage = totalSessions > 0 
                ? (completedSessions * 100.0) / totalSessions 
                : 0.0;
        
        // Trouver la dernière séance complétée
        Optional<TherapySession> lastSession = sessions.stream()
                .filter(s -> "Completed".equals(s.getStatus()))
                .max(Comparator.comparing(TherapySession::getScheduledDate));
        
        // Trouver la prochaine séance planifiée
        LocalDate today = LocalDate.now();
        Optional<TherapySession> nextSession = sessions.stream()
                .filter(s -> ("Scheduled".equals(s.getStatus()) || "Rescheduled".equals(s.getStatus())))
                .filter(s -> s.getScheduledDate().isAfter(today) || s.getScheduledDate().isEqual(today))
                .min(Comparator.comparing(TherapySession::getScheduledDate)
                        .thenComparing(TherapySession::getStartTime));
        
        // Déterminer le type de thérapie actuel (le plus fréquent)
        String currentTherapyType = sessions.stream()
                .filter(s -> s.getTherapyType() != null)
                .collect(Collectors.groupingBy(TherapySession::getTherapyType, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Non spécifié");
        
        // Déterminer le statut
        String status;
        if (scheduledSessions > 0) {
            status = "Active";
        } else if (completedSessions > 0 && scheduledSessions == 0) {
            status = "Completed";
        } else {
            status = "Inactive";
        }
        
        return PatientProgressDTO.builder()
                .patientId(patientId)
                .patientName(patient.getName())
                .patientEmail(patient.getEmail())
                .currentTherapyType(currentTherapyType)
                .totalSessions((int) totalSessions)
                .completedSessions((int) completedSessions)
                .scheduledSessions((int) scheduledSessions)
                .cancelledSessions((int) cancelledSessions)
                .progressPercentage(Math.round(progressPercentage * 10.0) / 10.0)
                .lastSessionDate(lastSession.map(s -> s.getScheduledDate().toString()).orElse(null))
                .lastSessionType(lastSession.map(TherapySession::getTherapyType).orElse(null))
                .lastSessionNote(lastSession.map(TherapySession::getProgressNote).orElse(null))
                .nextSessionDate(nextSession.map(s -> s.getScheduledDate().toString()).orElse(null))
                .nextSessionTime(nextSession.map(s -> s.getStartTime().toString()).orElse(null))
                .nextSessionType(nextSession.map(TherapySession::getTherapyType).orElse(null))
                .status(status)
                .build();
    }
}
