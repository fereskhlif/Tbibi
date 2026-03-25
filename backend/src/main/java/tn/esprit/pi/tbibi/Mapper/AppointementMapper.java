package tn.esprit.pi.tbibi.Mapper;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;
import tn.esprit.pi.tbibi.DTO.ScheduleRequest;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.Schedule;

import java.util.List;
import java.util.stream.Collectors;

@Component
@Primary
public class AppointementMapper implements IAppointementMapper {

    // ── Appointment → Entity ─────────────────────────────────────────────────

    @Override
    public Appointment toEntity(AppointmentRequest request) {
        return Appointment.builder()
                .doctor(request.getDoctor())
                .specialty(request.getSpecialty())
                .service(request.getService())
                .reasonForVisit(request.getReasonForVisit())
                .statusAppointement(request.getStatus())
                // schedule is injected by the service after DB lookup
                .build();
    }

    // ── Appointment → Response ───────────────────────────────────────────────

    @Override
    public AppointmentResponse toResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .appointmentId(Math.toIntExact(appointment.getAppointmentId()))
                .doctor(appointment.getDoctor())
                .specialty(appointment.getSpecialty())
                .service(appointment.getService())
                .reasonForVisit(appointment.getReasonForVisit())
                .status(appointment.getStatusAppointement())
                .scheduleId(appointment.getSchedule().getScheduleId())
                .scheduleDate(appointment.getSchedule().getDate().toString())
                .scheduleTime(appointment.getSchedule().getStartTime().toString())
                .build();
    }

    // ── List<Appointment> → List<AppointmentResponse> ────────────────────────

    @Override
    public List<AppointmentResponse> toResponseList(List<Appointment> appointments) {
        return appointments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Update entity in-place ───────────────────────────────────────────────

    @Override
    public void updateEntityFromRequest(AppointmentRequest request, Appointment appointment) {
        appointment.setDoctor(request.getDoctor());
        appointment.setSpecialty(request.getSpecialty());
        appointment.setService(request.getService());
        appointment.setReasonForVisit(request.getReasonForVisit());
        appointment.setStatusAppointement(request.getStatus());
        // schedule is updated by the service after DB lookup
    }

    // ── Schedule → Entity ────────────────────────────────────────────────────

    @Override
    public Schedule toScheduleEntity(ScheduleRequest request) {
        return Schedule.builder()
                .date(request.getDate())
                .startTime(request.getStartTime())
                .isAvailable(request.getIsAvailable())
                .build();
    }

    // ── Schedule → Response ──────────────────────────────────────────────────

    @Override
    public ScheduleResponse toScheduleResponse(Schedule schedule) {
        return ScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .date(schedule.getDate())
                .startTime(schedule.getStartTime())
                .isAvailable(schedule.getIsAvailable())
                .build();
    }

    // ── List<Schedule> → List<ScheduleResponse> ──────────────────────────────

    @Override
    public List<ScheduleResponse> toScheduleResponseList(List<Schedule> schedules) {
        return schedules.stream()
                .map(this::toScheduleResponse)
                .collect(Collectors.toList());
    }
}