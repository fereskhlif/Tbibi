package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;
import tn.esprit.pi.tbibi.DTO.VerificationRequest;
import tn.esprit.pi.tbibi.Mapper.IAppointementMapper;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.StatusAppointement;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;
import tn.esprit.pi.tbibi.repositories.NotificationRepo;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AppointementServiceTest {

    @Mock
    private AppointmentRepo appointmentRepository;

    @Mock
    private ScheduleRepo scheduleRepository;

    @Mock
    private UserRepo userRepo;

    @Mock
    private IAppointementMapper mapper;

    @Mock
    private NotificationRepo notificationRepo;

    @Mock
    private VerificationService verificationService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AppointementService appointementService;

    private Schedule schedule;
    private User patient;
    private User doctor;
    private Appointment appointment;
    private AppointmentRequest request;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setUserId(1);
        patient.setName("Jane Doe");
        patient.setEmail("jane@example.com");

        doctor = new User();
        doctor.setUserId(2);
        doctor.setName("Dr. Smith");

        schedule = new Schedule();
        schedule.setScheduleId(10L);
        schedule.setIsAvailable(true);
        schedule.setDoctor(doctor);

        appointment = new Appointment();
        appointment.setAppointmentId(100L);

        request = AppointmentRequest.builder()
                .userId(1)
                .scheduleId(10L)
                .statusAppointement("PENDING")
                .doctor("Dr. Smith")
                .specialty("Cardiology")
                .reasonForVisit("Checkup")
                .build();
    }

    @Test
    void testCreate_Success() {
        when(scheduleRepository.findById(10L)).thenReturn(Optional.of(schedule));
        when(mapper.toEntity(request)).thenReturn(appointment);
        when(userRepo.findById(1L)).thenReturn(Optional.of(patient));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        
        AppointmentResponse responseDto = new AppointmentResponse();
        responseDto.setAppointmentId(100L);
        when(mapper.toResponse(any(Appointment.class))).thenReturn(responseDto);

        AppointmentResponse result = appointementService.create(request);

        assertNotNull(result);
        assertEquals(100L, result.getAppointmentId());
        assertFalse(schedule.getIsAvailable()); // checks schedule was marked unavailable
        verify(scheduleRepository).save(schedule);
        verify(notificationRepo).save(any()); // checks doctor notification was created
    }

    @Test
    void testVerifyAndConfirm_Success() {
        VerificationRequest vReq = VerificationRequest.builder()
                .userId(1)
                .patientEmail("jane@example.com")
                .scheduleId(10L)
                .doctor("Dr. Smith")
                .specialty("Cardiology")
                .reasonForVisit("Checkup")
                .patientName("Jane Doe")
                .build();

        VerificationService.PendingVerification pv = new VerificationService.PendingVerification(
                vReq, "code123", System.currentTimeMillis());

        when(verificationService.consume("verify123", "code123")).thenReturn(pv);
        when(userRepo.findByEmail("jane@example.com")).thenReturn(Optional.of(patient));
        
        when(scheduleRepository.findById(10L)).thenReturn(Optional.of(schedule));
        when(mapper.toEntity(any(AppointmentRequest.class))).thenReturn(appointment);
        when(userRepo.findById(1L)).thenReturn(Optional.of(patient));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        
        AppointmentResponse responseDto = new AppointmentResponse();
        responseDto.setAppointmentId(100L);
        when(mapper.toResponse(any(Appointment.class))).thenReturn(responseDto);

        AppointmentResponse result = appointementService.verifyAndConfirm("verify123", "code123");

        assertNotNull(result);
        assertEquals(100L, result.getAppointmentId());
        
        // Assert meeting link and patient name were persisted
        verify(appointmentRepository, times(2)).save(any(Appointment.class)); // 1 inside create, 1 inside verifyAndConfirm
        assertNotNull(appointment.getMeetingLink());
        assertEquals("Jane Doe", appointment.getPatientName());
    }

    @Test
    void testGetByUserId_Success() {
        when(appointmentRepository.findByUserUserId(1)).thenReturn(List.of(appointment));
        
        AppointmentResponse res = new AppointmentResponse();
        res.setAppointmentId(100L);
        when(mapper.toResponseList(anyList())).thenReturn(List.of(res));
        
        List<AppointmentResponse> results = appointementService.getByUserId(1);
        
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(100L, results.get(0).getAppointmentId());
        verify(appointmentRepository).findByUserUserId(1);
    }
    
    @Test
    void testGetByDoctorId_Success() {
        when(appointmentRepository.findByDoctorUserId(2)).thenReturn(List.of(appointment));
        
        AppointmentResponse res = new AppointmentResponse();
        res.setAppointmentId(100L);
        when(mapper.toResponseList(anyList())).thenReturn(List.of(res));
        
        List<AppointmentResponse> results = appointementService.getByDoctorId(2);
        
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(100L, results.get(0).getAppointmentId());
        verify(appointmentRepository).findByDoctorUserId(2);
    }
    
    @Test
    void testUpdateStatus_Cancelled_ReopensSchedule() {
        appointment.setSchedule(schedule);
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        
        AppointmentResponse res = new AppointmentResponse();
        res.setAppointmentId(100L);
        res.setStatusAppointement(StatusAppointement.CANCELLED);
        when(mapper.toResponse(any(Appointment.class))).thenReturn(res);
        
        AppointmentResponse result = appointementService.updateStatus(100L, StatusAppointement.CANCELLED);
        
        assertEquals(StatusAppointement.CANCELLED, result.getStatusAppointement());
        assertTrue(schedule.getIsAvailable());
        verify(scheduleRepository).save(schedule);
    }
    
    @Test
    void testReschedule_Success() {
        Schedule newSchedule = new Schedule();
        newSchedule.setScheduleId(20L);
        newSchedule.setIsAvailable(true);
        
        appointment.setSchedule(schedule); // currently holds old schedule
        
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(scheduleRepository.findById(20L)).thenReturn(Optional.of(newSchedule));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        
        AppointmentResponse res = new AppointmentResponse();
        res.setAppointmentId(100L);
        res.setStatusAppointement(StatusAppointement.PENDING);
        when(mapper.toResponse(any(Appointment.class))).thenReturn(res);
        
        AppointmentResponse result = appointementService.reschedule(100L, 20L);
        
        assertEquals(StatusAppointement.PENDING, result.getStatusAppointement());
        assertTrue(schedule.getIsAvailable()); // Old freed
        assertFalse(newSchedule.getIsAvailable()); // New booked
        verify(scheduleRepository).save(schedule);
        verify(scheduleRepository).save(newSchedule);
    }
}
