package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.PatientProgressDTO;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionRequest;
import tn.esprit.pi.tbibi.DTO.dtoTherapySession.TherapySessionResponse;
import tn.esprit.pi.tbibi.entities.TherapySession;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.TherapySessionMapper;
import tn.esprit.pi.tbibi.repositories.TherapySessionRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.services.TherapySessionService.TherapySessionService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TherapySessionServiceTest {

    @Mock
    private TherapySessionRepository sessionRepo;

    @Mock
    private UserRepo userRepo;

    @Mock
    private TherapySessionMapper mapper;

    @InjectMocks
    private TherapySessionService service;

    private User patient;
    private User physiotherapist;
    private TherapySession session;
    private TherapySessionRequest request;
    private TherapySessionResponse response;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setUserId(6);
        patient.setName("Patient Test");
        patient.setEmail("patient@test.com");

        physiotherapist = new User();
        physiotherapist.setUserId(9);
        physiotherapist.setName("Physio Test");
        physiotherapist.setEmail("physio@test.com");

        session = new TherapySession();
        session.setSessionId(1);
        session.setTherapyType("Massage");
        session.setScheduledDate(LocalDate.now().plusDays(1));
        session.setStartTime(LocalTime.of(10, 0));
        session.setEndTime(LocalTime.of(11, 0));
        session.setDurationMinutes(60);
        session.setStatus("Scheduled");
        session.setPatient(patient);
        session.setPhysiotherapist(physiotherapist);

        request = TherapySessionRequest.builder()
            .therapyType("Massage")
            .scheduledDate(LocalDate.now().plusDays(1))
            .startTime(LocalTime.of(10, 0))
            .endTime(LocalTime.of(11, 0))
            .durationMinutes(60)
            .patientId(6)
            .physiotherapistId(9)
            .build();

        response = TherapySessionResponse.builder()
            .sessionId(1)
            .therapyType("Massage")
            .scheduledDate(LocalDate.now().plusDays(1))
            .startTime(LocalTime.of(10, 0))
            .endTime(LocalTime.of(11, 0))
            .durationMinutes(60)
            .status("Scheduled")
            .patientId(6)
            .patientFullName("Patient Test")
            .physiotherapistId(9)
            .physiotherapistFullName("Physio Test")
            .build();
    }

    @Test
    void testCreateSession_Success() {
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));
        when(userRepo.findById(9)).thenReturn(Optional.of(physiotherapist));
        when(mapper.toEntity(any())).thenReturn(session);
        when(sessionRepo.save(any())).thenReturn(session);
        when(mapper.toResponse(any())).thenReturn(response);

        TherapySessionResponse result = service.create(request);

        assertNotNull(result);
        assertEquals("Massage", result.getTherapyType());
        assertEquals("Scheduled", result.getStatus());
        verify(sessionRepo, times(1)).save(any());
    }

    @Test
    void testCreateSession_PatientNotFound_ThrowsException() {
        when(userRepo.findById(6)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.create(request));
    }

    @Test
    void testCreateSession_PhysiotherapistNotFound_ThrowsException() {
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));
        when(userRepo.findById(9)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.create(request));
    }

    @Test
    void testGetById_Success() {
        when(sessionRepo.findById(1)).thenReturn(Optional.of(session));
        when(mapper.toResponse(any())).thenReturn(response);

        TherapySessionResponse result = service.getById(1);

        assertNotNull(result);
        assertEquals(1, result.getSessionId());
        verify(sessionRepo, times(1)).findById(1);
    }

    @Test
    void testGetById_NotFound_ThrowsException() {
        when(sessionRepo.findById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.getById(999));
    }

    @Test
    void testGetAll_Success() {
        when(sessionRepo.findAll()).thenReturn(Arrays.asList(session));
        when(mapper.toResponse(any())).thenReturn(response);

        List<TherapySessionResponse> results = service.getAll();

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(sessionRepo, times(1)).findAll();
    }

    @Test
    void testGetByPatient_Success() {
        when(sessionRepo.findByPatient_UserId(6)).thenReturn(Arrays.asList(session));
        when(mapper.toResponse(any())).thenReturn(response);

        List<TherapySessionResponse> results = service.getByPatient(6);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Patient Test", results.get(0).getPatientFullName());
    }

    @Test
    void testGetByPhysiotherapist_Success() {
        when(sessionRepo.findByPhysiotherapist_UserId(9)).thenReturn(Arrays.asList(session));
        when(mapper.toResponse(any())).thenReturn(response);

        List<TherapySessionResponse> results = service.getByPhysiotherapist(9);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Physio Test", results.get(0).getPhysiotherapistFullName());
    }

    @Test
    void testGetUpcomingSessions_Success() {
        when(sessionRepo.findByPhysiotherapist_UserId(9)).thenReturn(Arrays.asList(session));
        when(mapper.toResponse(any())).thenReturn(response);

        List<TherapySessionResponse> results = service.getUpcomingSessions(9);

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void testGetUpcomingSessions_FiltersCompletedAndCancelled() {
        TherapySession completedSession = new TherapySession();
        completedSession.setSessionId(2);
        completedSession.setStatus("Completed");
        completedSession.setScheduledDate(LocalDate.now().plusDays(1));
        completedSession.setStartTime(LocalTime.of(10, 0));
        completedSession.setPatient(patient);
        completedSession.setPhysiotherapist(physiotherapist);

        when(sessionRepo.findByPhysiotherapist_UserId(9))
            .thenReturn(Arrays.asList(session, completedSession));
        when(mapper.toResponse(session)).thenReturn(response);

        List<TherapySessionResponse> results = service.getUpcomingSessions(9);

        assertEquals(1, results.size());
        assertEquals("Scheduled", results.get(0).getStatus());
    }

    @Test
    void testStartSession_Success() {
        when(sessionRepo.findById(1)).thenReturn(Optional.of(session));
        when(sessionRepo.save(any())).thenReturn(session);
        when(mapper.toResponse(any())).thenReturn(response);

        TherapySessionResponse result = service.startSession(1);

        assertNotNull(result);
        verify(sessionRepo, times(1)).save(any());
        assertEquals("In Progress", session.getStatus());
        assertNotNull(session.getActualStartTime());
    }

    @Test
    void testDocumentSession_Success() {
        session.setStatus("In Progress");
        when(sessionRepo.findById(1)).thenReturn(Optional.of(session));
        when(sessionRepo.save(any())).thenReturn(session);
        when(mapper.toResponse(any())).thenReturn(response);

        TherapySessionResponse result = service.documentSession(1, 
            "Exercices de flexion", 
            "Patient progresse bien");

        assertNotNull(result);
        assertEquals("Exercices de flexion", session.getExercisesPerformed());
        assertEquals("Patient progresse bien", session.getSessionNotes());
        verify(sessionRepo, times(1)).save(any());
    }

    @Test
    void testDocumentSession_NotInProgress_ThrowsException() {
        session.setStatus("Scheduled");
        when(sessionRepo.findById(1)).thenReturn(Optional.of(session));

        assertThrows(RuntimeException.class, () -> 
            service.documentSession(1, "Exercices", "Notes"));
    }

    @Test
    void testCompleteSession_Success() {
        session.setStatus("In Progress");
        session.setActualStartTime(LocalTime.of(10, 0));
        when(sessionRepo.findById(1)).thenReturn(Optional.of(session));
        when(sessionRepo.save(any())).thenReturn(session);
        when(mapper.toResponse(any())).thenReturn(response);

        TherapySessionRequest completeRequest = TherapySessionRequest.builder()
            .progressNote("Bonne progression")
            .evaluationResult("Excellent")
            .build();

        TherapySessionResponse result = service.completeSession(1, completeRequest);

        assertNotNull(result);
        assertEquals("Completed", session.getStatus());
        assertNotNull(session.getActualEndTime());
        assertNotNull(session.getActualDurationMinutes());
        verify(sessionRepo, times(1)).save(any());
    }

    @Test
    void testCancelSession_Success() {
        when(sessionRepo.findById(1)).thenReturn(Optional.of(session));
        when(sessionRepo.save(any())).thenReturn(session);
        when(mapper.toResponse(any())).thenReturn(response);

        TherapySessionResponse result = service.cancelSession(1);

        assertNotNull(result);
        assertEquals("Cancelled", session.getStatus());
        verify(sessionRepo, times(1)).save(any());
    }

    @Test
    void testRescheduleSession_Success() {
        LocalDate newDate = LocalDate.now().plusDays(2);
        LocalTime newStart = LocalTime.of(14, 0);
        LocalTime newEnd = LocalTime.of(15, 0);

        when(sessionRepo.findById(1)).thenReturn(Optional.of(session));
        when(sessionRepo.save(any())).thenReturn(session);
        when(mapper.toResponse(any())).thenReturn(response);

        TherapySessionResponse result = service.rescheduleSession(1, newDate, newStart, newEnd);

        assertNotNull(result);
        assertEquals("Rescheduled", session.getStatus());
        assertEquals(newDate, session.getScheduledDate());
        assertEquals(newStart, session.getStartTime());
        assertEquals(newEnd, session.getEndTime());
        verify(sessionRepo, times(1)).save(any());
    }

    @Test
    void testDelete_Success() {
        doNothing().when(sessionRepo).deleteById(1);

        service.delete(1);

        verify(sessionRepo, times(1)).deleteById(1);
    }

    @Test
    void testGetPatientProgressByPhysiotherapist_Success() {
        TherapySession completedSession = new TherapySession();
        completedSession.setSessionId(2);
        completedSession.setStatus("Completed");
        completedSession.setScheduledDate(LocalDate.now().minusDays(1));
        completedSession.setPatient(patient);
        completedSession.setPhysiotherapist(physiotherapist);
        completedSession.setTherapyType("Massage");

        when(sessionRepo.findByPhysiotherapist_UserId(9))
            .thenReturn(Arrays.asList(session, completedSession));
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));

        List<PatientProgressDTO> results = service.getPatientProgressByPhysiotherapist(9);

        assertNotNull(results);
        assertEquals(1, results.size());
        PatientProgressDTO progress = results.get(0);
        assertEquals(6, progress.getPatientId());
        assertEquals("Patient Test", progress.getPatientName());
        assertEquals(2, progress.getTotalSessions());
        assertEquals(1, progress.getCompletedSessions());
        assertEquals(50.0, progress.getProgressPercentage(), 0.1);
    }

    @Test
    void testGetPatientProgress_Success() {
        when(sessionRepo.findByPhysiotherapist_UserId(9)).thenReturn(Arrays.asList(session));
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));

        PatientProgressDTO result = service.getPatientProgress(6, 9);

        assertNotNull(result);
        assertEquals(6, result.getPatientId());
        assertEquals("Patient Test", result.getPatientName());
        assertEquals(1, result.getTotalSessions());
    }

    @Test
    void testGetPatientProgress_CalculatesProgressPercentage() {
        TherapySession completed1 = createSession(2, "Completed");
        TherapySession completed2 = createSession(3, "Completed");
        TherapySession scheduled = createSession(4, "Scheduled");

        when(sessionRepo.findByPhysiotherapist_UserId(9))
            .thenReturn(Arrays.asList(completed1, completed2, scheduled));
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));

        PatientProgressDTO result = service.getPatientProgress(6, 9);

        assertEquals(3, result.getTotalSessions());
        assertEquals(2, result.getCompletedSessions());
        assertEquals(66.7, result.getProgressPercentage(), 0.1);
    }

    @Test
    void testGetPatientProgress_DeterminesActiveStatus() {
        session.setStatus("Scheduled");
        when(sessionRepo.findByPhysiotherapist_UserId(9)).thenReturn(Arrays.asList(session));
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));

        PatientProgressDTO result = service.getPatientProgress(6, 9);

        assertEquals("Active", result.getStatus());
        assertEquals(1, result.getScheduledSessions());
    }

    @Test
    void testGetPatientProgress_DeterminesCompletedStatus() {
        session.setStatus("Completed");
        when(sessionRepo.findByPhysiotherapist_UserId(9)).thenReturn(Arrays.asList(session));
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));

        PatientProgressDTO result = service.getPatientProgress(6, 9);

        assertEquals("Completed", result.getStatus());
        assertEquals(1, result.getCompletedSessions());
        assertEquals(0, result.getScheduledSessions());
    }

    @Test
    void testUpdate_Success() {
        TherapySessionRequest updateRequest = TherapySessionRequest.builder()
            .therapyType("Rééducation")
            .progressNote("Amélioration notable")
            .build();

        when(sessionRepo.findById(1)).thenReturn(Optional.of(session));
        when(sessionRepo.save(any())).thenReturn(session);
        when(mapper.toResponse(any())).thenReturn(response);

        TherapySessionResponse result = service.update(1, updateRequest);

        assertNotNull(result);
        assertEquals("Rééducation", session.getTherapyType());
        assertEquals("Amélioration notable", session.getProgressNote());
        verify(sessionRepo, times(1)).save(any());
    }

    @Test
    void testCompleteSession_CalculatesActualDuration() {
        session.setStatus("In Progress");
        session.setActualStartTime(LocalTime.of(10, 0));
        
        when(sessionRepo.findById(1)).thenReturn(Optional.of(session));
        when(sessionRepo.save(any())).thenAnswer(invocation -> {
            TherapySession saved = invocation.getArgument(0);
            saved.setActualEndTime(LocalTime.of(11, 30));
            return saved;
        });
        when(mapper.toResponse(any())).thenReturn(response);

        TherapySessionRequest completeRequest = TherapySessionRequest.builder().build();
        service.completeSession(1, completeRequest);

        assertNotNull(session.getActualEndTime());
        assertNotNull(session.getActualDurationMinutes());
    }

    private TherapySession createSession(Integer id, String status) {
        TherapySession s = new TherapySession();
        s.setSessionId(id);
        s.setStatus(status);
        s.setScheduledDate(LocalDate.now());
        s.setStartTime(LocalTime.of(10, 0));
        s.setPatient(patient);
        s.setPhysiotherapist(physiotherapist);
        s.setTherapyType("Massage");
        return s;
    }
}
