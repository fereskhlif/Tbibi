package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan.TreatmentPlanRequest;
import tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan.TreatmentPlanResponse;
import tn.esprit.pi.tbibi.entities.TreatmentPlan;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.TreatmentPlanMapper;
import tn.esprit.pi.tbibi.repositories.TreatmentPlanRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.services.TreatmentPlanService.TreatmentPlanService;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TreatmentPlanServiceTest {

    @Mock
    private TreatmentPlanRepository planRepo;

    @Mock
    private UserRepo userRepo;

    @Mock
    private TreatmentPlanMapper mapper;

    @InjectMocks
    private TreatmentPlanService service;

    private User patient;
    private User physiotherapist;
    private TreatmentPlan plan;
    private TreatmentPlanRequest request;
    private TreatmentPlanResponse response;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setUserId(6);
        patient.setName("Patient Test");

        physiotherapist = new User();
        physiotherapist.setUserId(9);
        physiotherapist.setName("Physio Test");

        plan = new TreatmentPlan();
        plan.setPlanId(1);
        plan.setPlanName("Plan de rééducation");
        plan.setDiagnosis("Entorse cheville");
        plan.setTherapeuticGoals("Retrouver mobilité complète");
        plan.setExercises("Exercices de flexion");
        plan.setDurationWeeks(4);
        plan.setStartDate(LocalDate.now());
        plan.setEndDate(LocalDate.now().plusWeeks(4));
        plan.setStatus("Active");
        plan.setPatient(patient);
        plan.setPhysiotherapist(physiotherapist);

        request = TreatmentPlanRequest.builder()
            .planName("Plan de rééducation")
            .diagnosis("Entorse cheville")
            .therapeuticGoals("Retrouver mobilité complète")
            .exercises("Exercices de flexion")
            .durationWeeks(4)
            .startDate(LocalDate.now())
            .status("Active")
            .patientId(6)
            .physiotherapistId(9)
            .build();

        response = TreatmentPlanResponse.builder()
            .planId(1)
            .planName("Plan de rééducation")
            .diagnosis("Entorse cheville")
            .status("Active")
            .patientId(6)
            .patientName("Patient Test")
            .physiotherapistId(9)
            .physiotherapistName("Physio Test")
            .build();
    }

    @Test
    void testCreatePlan_Success() {
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));
        when(userRepo.findById(9)).thenReturn(Optional.of(physiotherapist));
        when(mapper.toEntity(any())).thenReturn(plan);
        when(planRepo.save(any())).thenReturn(plan);
        when(mapper.toResponse(any())).thenReturn(response);

        TreatmentPlanResponse result = service.create(request);

        assertNotNull(result);
        assertEquals("Plan de rééducation", result.getPlanName());
        verify(planRepo, times(1)).save(any());
    }

    @Test
    void testCreatePlan_CalculatesEndDate() {
        when(userRepo.findById(6)).thenReturn(Optional.of(patient));
        when(userRepo.findById(9)).thenReturn(Optional.of(physiotherapist));
        when(mapper.toEntity(any())).thenReturn(plan);
        when(planRepo.save(any())).thenReturn(plan);
        when(mapper.toResponse(any())).thenReturn(response);

        service.create(request);

        assertNotNull(plan.getEndDate());
        assertEquals(LocalDate.now().plusWeeks(4), plan.getEndDate());
    }

    @Test
    void testCreatePlan_PatientNotFound_ThrowsException() {
        when(userRepo.findById(6)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.create(request));
    }

    @Test
    void testGetById_Success() {
        when(planRepo.findById(1)).thenReturn(Optional.of(plan));
        when(mapper.toResponse(any())).thenReturn(response);

        TreatmentPlanResponse result = service.getById(1);

        assertNotNull(result);
        assertEquals(1, result.getPlanId());
        verify(planRepo, times(1)).findById(1);
    }

    @Test
    void testGetById_NotFound_ThrowsException() {
        when(planRepo.findById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.getById(999));
    }

    @Test
    void testGetAll_Success() {
        when(planRepo.findAll()).thenReturn(Arrays.asList(plan));
        when(mapper.toResponse(any())).thenReturn(response);

        List<TreatmentPlanResponse> results = service.getAll();

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(planRepo, times(1)).findAll();
    }

    @Test
    void testGetByPatient_Success() {
        when(planRepo.findByPatient_UserId(6)).thenReturn(Arrays.asList(plan));
        when(mapper.toResponse(any())).thenReturn(response);

        List<TreatmentPlanResponse> results = service.getByPatient(6);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Patient Test", results.get(0).getPatientName());
    }

    @Test
    void testGetByPhysiotherapist_Success() {
        when(planRepo.findByPhysiotherapist_UserId(9)).thenReturn(Arrays.asList(plan));
        when(mapper.toResponse(any())).thenReturn(response);

        List<TreatmentPlanResponse> results = service.getByPhysiotherapist(9);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Physio Test", results.get(0).getPhysiotherapistName());
    }

    @Test
    void testUpdate_Success() {
        TreatmentPlanRequest updateRequest = TreatmentPlanRequest.builder()
            .planName("Plan modifié")
            .status("Completed")
            .build();

        when(planRepo.findById(1)).thenReturn(Optional.of(plan));
        when(planRepo.save(any())).thenReturn(plan);
        when(mapper.toResponse(any())).thenReturn(response);

        TreatmentPlanResponse result = service.update(1, updateRequest);

        assertNotNull(result);
        assertEquals("Plan modifié", plan.getPlanName());
        assertEquals("Completed", plan.getStatus());
        verify(planRepo, times(1)).save(any());
    }

    @Test
    void testUpdate_RecalculatesEndDateWhenDurationChanges() {
        TreatmentPlanRequest updateRequest = TreatmentPlanRequest.builder()
            .durationWeeks(6)
            .build();

        when(planRepo.findById(1)).thenReturn(Optional.of(plan));
        when(planRepo.save(any())).thenReturn(plan);
        when(mapper.toResponse(any())).thenReturn(response);

        service.update(1, updateRequest);

        assertEquals(6, plan.getDurationWeeks());
        assertEquals(plan.getStartDate().plusWeeks(6), plan.getEndDate());
    }

    @Test
    void testDelete_Success() {
        doNothing().when(planRepo).deleteById(1);

        service.delete(1);

        verify(planRepo, times(1)).deleteById(1);
    }
}
