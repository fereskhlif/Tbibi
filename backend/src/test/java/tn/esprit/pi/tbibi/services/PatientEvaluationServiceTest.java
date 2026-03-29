package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation.PatientEvaluationRequest;
import tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation.PatientEvaluationResponse;
import tn.esprit.pi.tbibi.entities.PatientEvaluation;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.PatientEvaluationMapper;
import tn.esprit.pi.tbibi.repositories.PatientEvaluationRepository;
import tn.esprit.pi.tbibi.repositories.UserRepository;
import tn.esprit.pi.tbibi.services.PatientEvaluationService.PatientEvaluationService;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientEvaluationServiceTest {

    @Mock
    private PatientEvaluationRepository evalRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private PatientEvaluationMapper mapper;

    @InjectMocks
    private PatientEvaluationService service;

    private User patient;
    private User physiotherapist;
    private PatientEvaluation evaluation;
    private PatientEvaluationRequest request;
    private PatientEvaluationResponse response;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setUserId(6);
        patient.setName("Patient Test");

        physiotherapist = new User();
        physiotherapist.setUserId(9);
        physiotherapist.setName("Physio Test");

        evaluation = new PatientEvaluation();
        evaluation.setEvaluationId(1);
        evaluation.setPainScale(5);
        evaluation.setPainDescription("Douleur modérée");
        evaluation.setFlexionDegrees(90);
        evaluation.setExtensionDegrees(45);
        evaluation.setJointLocation("Genou droit");
        evaluation.setEvaluationDate(LocalDate.now());
        evaluation.setPatient(patient);
        evaluation.setPhysiotherapist(physiotherapist);

        request = PatientEvaluationRequest.builder()
            .painScale(5)
            .painDescription("Douleur modérée")
            .flexionDegrees(90)
            .extensionDegrees(45)
            .jointLocation("Genou droit")
            .patientId(6)
            .physiotherapistId(9)
            .build();

        response = PatientEvaluationResponse.builder()
            .evaluationId(1)
            .painScale(5)
            .painDescription("Douleur modérée")
            .patientId(6)
            .patientName("Patient Test")
            .physiotherapistId(9)
            .physiotherapistName("Physio Test")
            .build();
    }

    @Test
    void testCreateEvaluation_Success() {
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));
        when(userRepo.findById(9)).thenReturn(Optional.of(physiotherapist));
        when(mapper.toEntity(any())).thenReturn(evaluation);
        when(evalRepo.save(any())).thenReturn(evaluation);
        when(mapper.toResponse(any())).thenReturn(response);

        PatientEvaluationResponse result = service.create(request);

        assertNotNull(result);
        assertEquals(5, result.getPainScale());
        verify(evalRepo, times(1)).save(any());
    }

    @Test
    void testCreateEvaluation_PatientNotFound_ThrowsException() {
        when(userRepo.findById(6)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.create(request));
    }

    @Test
    void testGetById_Success() {
        when(evalRepo.findById(1)).thenReturn(Optional.of(evaluation));
        when(mapper.toResponse(any())).thenReturn(response);

        PatientEvaluationResponse result = service.getById(1);

        assertNotNull(result);
        assertEquals(1, result.getEvaluationId());
        verify(evalRepo, times(1)).findById(1);
    }

    @Test
    void testGetById_NotFound_ThrowsException() {
        when(evalRepo.findById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.getById(999));
    }

    @Test
    void testGetAll_Success() {
        when(evalRepo.findAll()).thenReturn(Arrays.asList(evaluation));
        when(mapper.toResponse(any())).thenReturn(response);

        List<PatientEvaluationResponse> results = service.getAll();

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(evalRepo, times(1)).findAll();
    }

    @Test
    void testGetByPatient_Success() {
        when(evalRepo.findByPatient_UserIdOrderByEvaluationDateDesc(6)).thenReturn(Arrays.asList(evaluation));
        when(mapper.toResponse(evaluation)).thenReturn(response);

        List<PatientEvaluationResponse> results = service.getByPatient(6);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Patient Test", results.get(0).getPatientName());
    }

    @Test
    void testGetByPhysiotherapist_Success() {
        when(evalRepo.findByPhysiotherapist_UserId(9)).thenReturn(Arrays.asList(evaluation));
        when(mapper.toResponse(evaluation)).thenReturn(response);

        List<PatientEvaluationResponse> results = service.getByPhysiotherapist(9);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Physio Test", results.get(0).getPhysiotherapistName());
    }

    @Test
    void testUpdate_Success() {
        PatientEvaluationRequest updateRequest = PatientEvaluationRequest.builder()
            .painScale(3)
            .painDescription("Douleur légère")
            .build();

        when(evalRepo.findById(1)).thenReturn(Optional.of(evaluation));
        when(evalRepo.save(any())).thenReturn(evaluation);
        when(mapper.toResponse(any())).thenReturn(response);

        PatientEvaluationResponse result = service.update(1, updateRequest);

        assertNotNull(result);
        assertEquals(3, evaluation.getPainScale());
        assertEquals("Douleur légère", evaluation.getPainDescription());
        verify(evalRepo, times(1)).save(any());
    }

    @Test
    void testDelete_Success() {
        doNothing().when(evalRepo).deleteById(1);

        service.delete(1);

        verify(evalRepo, times(1)).deleteById(1);
    }

    @Test
    void testPainScaleValidation_WithinRange() {
        request.setPainScale(10);
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));
        when(userRepo.findById(9)).thenReturn(Optional.of(physiotherapist));
        when(mapper.toEntity(any())).thenReturn(evaluation);
        when(evalRepo.save(any())).thenReturn(evaluation);
        when(mapper.toResponse(any())).thenReturn(response);

        assertDoesNotThrow(() -> service.create(request));
    }
}
