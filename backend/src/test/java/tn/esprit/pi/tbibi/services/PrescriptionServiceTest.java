package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.repositories.PrescriptionRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PrescriptionServiceTest {

    @Mock
    private PrescriptionRepo prescriptionRepository;

    @Mock
    private UserRepo userRepository;

    @Mock
    private Prescription_Mapper mapper;

    @InjectMocks
    private PrescriptionService prescriptionService;

    private User mockPatient;
    private User mockDoctor;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("patient@test.com", "password")
        );

        mockPatient = new User();
        mockPatient.setUserId(1);
        mockPatient.setEmail("patient@test.com");
        mockPatient.setName("Test Patient");

        mockDoctor = new User();
        mockDoctor.setUserId(2);
        mockDoctor.setName("Test Doctor");
    }

    @Test
    void getMyPrescriptions_ShouldReturnOnlyConnectedPatientPrescriptions() {
        // Arrange
        MedicalReccords medicalFile = new MedicalReccords();
        medicalFile.setMedicalfile_id(10);  // int

        Acte acte = new Acte();
        acte.setActeId(100);   // int
        acte.setDoctorId(2);   // int

        Prescription prescription = new Prescription();
        prescription.setPrescriptionID(1000);  // int
        prescription.setActe(acte);

        acte.setPrescriptions(List.of(prescription));
        medicalFile.setActes(List.of(acte));
        mockPatient.setMedicalFiles(List.of(medicalFile));

        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(mockPatient));
        when(userRepository.findById(2L)).thenReturn(Optional.of(mockDoctor));

        PrescriptionResponse mappedDto = new PrescriptionResponse();
        mappedDto.setPrescriptionID(1000);  // int
        when(mapper.toDto(any(Prescription.class))).thenReturn(mappedDto);

        // Act
        List<PrescriptionResponse> result = prescriptionService.getMyPrescriptions();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());

        PrescriptionResponse dto = result.get(0);
        assertEquals(1000, dto.getPrescriptionID());       // int
        assertEquals(1L, dto.getPatientId().longValue());  // Long → longValue()
        assertEquals("Test Patient", dto.getPatientName());
        assertEquals(2L, dto.getDoctorId().longValue());   // Long → longValue()
        assertEquals("Test Doctor", dto.getDoctorName());

        verify(userRepository, times(1)).findByEmail("patient@test.com");
        verify(userRepository, times(1)).findById(2L);
        verify(mapper, times(1)).toDto(prescription);
    }

    @Test
    void getMyPrescriptions_ShouldReturnEmptyListWhenNoMedicalFiles() {
        // Arrange
        mockPatient.setMedicalFiles(null);
        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(mockPatient));

        // Act
        List<PrescriptionResponse> result = prescriptionService.getMyPrescriptions();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(userRepository, never()).findById(anyLong());
        verify(mapper, never()).toDto(any());
    }

    @Test
    void getMyPrescriptions_ShouldThrowExceptionWhenPatientNotFound() {
        // Arrange
        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            prescriptionService.getMyPrescriptions();
        }, "Patient not found: patient@test.com");
    }

    // --- DOCTOR TESTS ---
    @Test
    void add_ShouldCreatePrescriptionSuccessfully() {
        // Arrange
        PrescriptionRequest request = new PrescriptionRequest();
        request.setNote("Test Note");
        
        Prescription prescr = new Prescription();
        prescr.setPrescriptionID(1);
        prescr.setNote("Test Note");

        when(mapper.toEntity(request)).thenReturn(prescr);
        when(prescriptionRepository.save(any(Prescription.class))).thenReturn(prescr);
        
        PrescriptionResponse responseDTO = new PrescriptionResponse();
        responseDTO.setPrescriptionID(1);
        when(mapper.toDto(prescr)).thenReturn(responseDTO);

        // Act
        PrescriptionResponse result = prescriptionService.add(request);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getPrescriptionID());
        verify(prescriptionRepository, times(1)).save(any(Prescription.class));
    }

    // --- PHARMACIST TESTS ---
    @Test
    void updateStatus_ShouldChangeStatusSuccessfully() {
        // Arrange
        int prescriptionId = 1;
        Prescription existing = new Prescription();
        existing.setPrescriptionID(prescriptionId);
        existing.setStatus(PrescriptionStatus.PENDING);

        when(prescriptionRepository.findById(prescriptionId)).thenReturn(Optional.of(existing));
        when(prescriptionRepository.save(any(Prescription.class))).thenReturn(existing);

        PrescriptionResponse responseDTO = new PrescriptionResponse();
        responseDTO.setPrescriptionID(prescriptionId);
        responseDTO.setStatus(PrescriptionStatus.DISPENSED);
        when(mapper.toDto(existing)).thenReturn(responseDTO);

        // Act
        PrescriptionResponse result = prescriptionService.updateStatus(prescriptionId, PrescriptionStatus.DISPENSED);

        // Assert
        assertNotNull(result);
        assertEquals(PrescriptionStatus.DISPENSED, result.getStatus());
        assertEquals(PrescriptionStatus.DISPENSED, existing.getStatus());
        verify(prescriptionRepository, times(1)).findById(prescriptionId);
        verify(prescriptionRepository, times(1)).save(existing);
    }
}