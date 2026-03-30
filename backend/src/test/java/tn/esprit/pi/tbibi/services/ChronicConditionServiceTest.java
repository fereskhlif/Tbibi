package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.pi.tbibi.DTO.ChronicConditionRequest;
import tn.esprit.pi.tbibi.DTO.ChronicConditionResponse;
import tn.esprit.pi.tbibi.entities.ChronicCondition;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.ChronicConditionRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChronicConditionServiceTest {

    @Mock
    private ChronicConditionRepo repo;

    @Mock
    private UserRepo userRepo;

    @InjectMocks
    private ChronicConditionService service;

    private User doctor;
    private User patient;

    @BeforeEach
    void setUp() {
        doctor = new User();
        doctor.setUserId(2);
        doctor.setName("Dr. Doc");

        patient = new User();
        patient.setUserId(1);
        patient.setName("Jane Doe");
    }

    @Test
    void testCreate_MissingDoctorId() {
        ChronicConditionRequest req = new ChronicConditionRequest();
        req.setConditionType("HEART_RATE");

        assertThrows(IllegalArgumentException.class, () -> service.create(req));
    }

    @Test
    void testCreate_DoctorNotFound() {
        ChronicConditionRequest req = new ChronicConditionRequest();
        req.setDoctorId(999);
        when(userRepo.findById(999)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.create(req));
    }

    @Test
    void testCreate_Success() {
        ChronicConditionRequest req = new ChronicConditionRequest();
        req.setDoctorId(2);
        req.setPatientId(1);
        req.setConditionType("HEART_RATE");
        req.setValue(110.0);

        when(userRepo.findById(2)).thenReturn(Optional.of(doctor));
        when(userRepo.findById(1)).thenReturn(Optional.of(patient));

        ChronicCondition mockSaved = new ChronicCondition();
        mockSaved.setId(10L);
        mockSaved.setDoctor(doctor);
        mockSaved.setPatient(patient);
        mockSaved.setConditionType("HEART_RATE");
        mockSaved.setValue(110.0);
        mockSaved.setSeverity("WARNING");
        mockSaved.setUnit("bpm");

        when(repo.save(any(ChronicCondition.class))).thenReturn(mockSaved);

        ChronicConditionResponse res = service.create(req);

        assertNotNull(res);
        assertEquals(10L, res.getId());
        assertEquals("WARNING", res.getSeverity());
        assertEquals("bpm", res.getUnit());

        ArgumentCaptor<ChronicCondition> captor = ArgumentCaptor.forClass(ChronicCondition.class);
        verify(repo).save(captor.capture());
        ChronicCondition saved = captor.getValue();
        assertEquals("WARNING", saved.getSeverity());
        assertEquals("Jane Doe", saved.getPatientName());
    }

    @Test
    void testGetByDoctor_Success() {
        ChronicCondition c1 = new ChronicCondition();
        c1.setId(100L);
        c1.setDoctor(doctor);
        when(repo.findByDoctorUserIdOrderByRecordedAtDesc(2)).thenReturn(List.of(c1));

        List<ChronicConditionResponse> res = service.getByDoctor(2);
        assertEquals(1, res.size());
        assertEquals(100L, res.get(0).getId());
    }

    @Test
    void testGetByPatient_Success() {
        ChronicCondition c1 = new ChronicCondition();
        c1.setId(200L);
        c1.setPatient(patient);
        when(repo.findByPatientUserIdOrderByRecordedAtDesc(1)).thenReturn(List.of(c1));

        List<ChronicConditionResponse> res = service.getByPatient(1);
        assertEquals(1, res.size());
        assertEquals(200L, res.get(0).getId());
    }

    @Test
    void testComputeSeverity() {
        // Sugar
        assertEquals("CRITICAL", service.computeSeverity("BLOOD_SUGAR", 60.0, null));
        assertEquals("NORMAL", service.computeSeverity("BLOOD_SUGAR", 90.0, null));
        assertEquals("WARNING", service.computeSeverity("BLOOD_SUGAR", 110.0, null));
        assertEquals("CRITICAL", service.computeSeverity("BLOOD_SUGAR", 140.0, null));

        // Pressure
        assertEquals("CRITICAL", service.computeSeverity("BLOOD_PRESSURE", 80.0, 60.0));
        assertEquals("NORMAL", service.computeSeverity("BLOOD_PRESSURE", 110.0, 70.0));
        assertEquals("WARNING", service.computeSeverity("BLOOD_PRESSURE", 130.0, 80.0));
        assertEquals("CRITICAL", service.computeSeverity("BLOOD_PRESSURE", 150.0, 90.0));

        // Unknown
        assertEquals("NORMAL", service.computeSeverity("UNKNOWN", 500.0, 500.0));
    }
}
