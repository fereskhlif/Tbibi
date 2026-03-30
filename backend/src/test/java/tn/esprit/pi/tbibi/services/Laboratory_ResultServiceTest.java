package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultRequest;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultResponse;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.Laboratory_ResultMapper;
import tn.esprit.pi.tbibi.repositories.Laboratory_ResultRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.services.Laboratory_ResultService.Laboratory_ResultService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Laboratory_ResultServiceTest {

    @Mock
    private Laboratory_ResultRepository labRepo;

    @Mock
    private UserRepo userRepo;

    @Mock
    private Laboratory_ResultMapper mapper;

    @InjectMocks
    private Laboratory_ResultService service;

    private User labUser;
    private User patient;
    private User doctor;
    private Laboratory_Result labResult;
    private Laboratory_ResultRequest request;
    private Laboratory_ResultResponse response;

    @BeforeEach
    void setUp() {
        labUser = new User();
        labUser.setUserId(1);
        labUser.setName("Lab Tech");

        patient = new User();
        patient.setUserId(2);
        patient.setName("John Doe");

        doctor = new User();
        doctor.setUserId(3);
        doctor.setName("Dr. Smith");

        labResult = new Laboratory_Result();
        labResult.setLabId(1);
        labResult.setTestName("Blood Test");
        labResult.setStatus("Pending");
        labResult.setPriority("Normal");
        labResult.setLaboratoryUser(labUser);
        labResult.setPatient(patient);
        labResult.setPrescribedByDoctor(doctor);
        labResult.setRequestedAt(LocalDateTime.now());

        request = Laboratory_ResultRequest.builder()
            .testName("Blood Test")
            .location("Main Lab")
            .nameLabo("City Lab")
            .resultValue("Normal")
            .status("Pending")
            .testDate(LocalDate.now())
            .laboratoryUserId(1)
            .patientId(2)
            .prescribedByDoctorId(3)
            .priority("Normal")
            .requestedAt(LocalDateTime.now())
            .requestNotes("Routine checkup")
            .build();

        response = Laboratory_ResultResponse.builder()
            .labId(1)
            .testName("Blood Test")
            .status("Pending")
            .priority("Normal")
            .laboratoryUserId(1)
            .laboratoryUserName("Lab Tech")
            .patientId(2)
            .patientName("John Doe")
            .prescribedByDoctorId(3)
            .prescribedByDoctorName("Dr. Smith")
            .build();
    }

    @Test
    void testCreateLaboratoryResult_Success() {
        when(userRepo.findById(1)).thenReturn(Optional.of(labUser));
        when(userRepo.findById(2)).thenReturn(Optional.of(patient));
        when(userRepo.findById(3)).thenReturn(Optional.of(doctor));
        when(mapper.toEntity(any())).thenReturn(labResult);
        when(labRepo.save(any())).thenReturn(labResult);
        when(mapper.toResponse(any())).thenReturn(response);

        Laboratory_ResultResponse result = service.create(request);

        assertNotNull(result);
        assertEquals("Blood Test", result.getTestName());
        verify(labRepo, times(1)).save(any());
    }

    @Test
    void testCreateLaboratoryResult_WithoutLaboratoryUserId_ThrowsException() {
        Laboratory_ResultRequest invalidRequest = Laboratory_ResultRequest.builder()
            .testName("Blood Test")
            .laboratoryUserId(null)
            .build();

        assertThrows(RuntimeException.class, () -> service.create(invalidRequest));
    }

    @Test
    void testGetById_Success() {
        when(labRepo.findById(1)).thenReturn(Optional.of(labResult));
        when(mapper.toResponse(any())).thenReturn(response);

        Laboratory_ResultResponse result = service.getById(1);

        assertNotNull(result);
        assertEquals(1, result.getLabId());
        verify(labRepo, times(1)).findById(1);
    }

    @Test
    void testGetById_NotFound_ThrowsException() {
        when(labRepo.findById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.getById(999));
    }

    @Test
    void testGetAll_Success() {
        when(labRepo.findAll()).thenReturn(Arrays.asList(labResult));
        when(mapper.toResponse(any())).thenReturn(response);

        List<Laboratory_ResultResponse> results = service.getAll();

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(labRepo, times(1)).findAll();
    }

    @Test
    void testGetByPatient_Success() {
        when(labRepo.findByPatient_UserId(2)).thenReturn(Arrays.asList(labResult));
        when(mapper.toResponse(any())).thenReturn(response);

        List<Laboratory_ResultResponse> results = service.getByPatient(2);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("John Doe", results.get(0).getPatientName());
    }

    @Test
    void testGetByPrescribedByDoctor_Success() {
        when(labRepo.findByPrescribedByDoctor_UserId(3)).thenReturn(Arrays.asList(labResult));
        when(mapper.toResponse(any())).thenReturn(response);

        List<Laboratory_ResultResponse> results = service.getByPrescribedByDoctor(3);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Dr. Smith", results.get(0).getPrescribedByDoctorName());
    }

    @Test
    void testUpdateStatus_Success() {
        when(labRepo.findById(1)).thenReturn(Optional.of(labResult));
        when(labRepo.save(any())).thenReturn(labResult);
        when(mapper.toResponse(any())).thenReturn(response);

        Laboratory_ResultResponse result = service.updateStatus(1, "Completed");

        assertNotNull(result);
        verify(labRepo, times(1)).save(any());
    }

    @Test
    void testGetByPriority_Success() {
        when(labRepo.findByPriority("Critical")).thenReturn(Arrays.asList(labResult));
        when(mapper.toResponse(any())).thenReturn(response);

        List<Laboratory_ResultResponse> results = service.getByPriority("Critical");

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void testGetPendingRequests_Success() {
        when(labRepo.findByStatus("Pending")).thenReturn(Arrays.asList(labResult));
        when(mapper.toResponse(any())).thenReturn(response);

        List<Laboratory_ResultResponse> results = service.getPendingRequests();

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Pending", results.get(0).getStatus());
    }
}
