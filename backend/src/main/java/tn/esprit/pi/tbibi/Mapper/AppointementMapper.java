package tn.esprit.pi.tbibi.Mapper;

import tn.esprit.pi.tbibi.DTO.*;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.ConsultationRoom;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.StatusAppointement;
import tn.esprit.pi.tbibi.entities.Teleconsultation;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class AppointementMapper implements IAppointementMapper {

    // ── Appointment → Entity ─────────────────────────────────────────────────

    public Appointment toEntity(AppointmentRequest request) {
        StatusAppointement status = StatusAppointement.PENDING;
        if (request.getStatusAppointement() != null) {
            try {
                status = StatusAppointement.valueOf(request.getStatusAppointement().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        return Appointment.builder()
                .doctor(request.getDoctor())
                .specialty(request.getSpecialty())
                .service(request.getService())
                .reasonForVisit(request.getReasonForVisit())
                .statusAppointement(status)
                // schedule and user are injected by the service after DB lookup
                .build();
    }

    // ── Appointment → Response ───────────────────────────────────────────────

    public AppointmentResponse toResponse(Appointment appointment) {
        AppointmentResponse.AppointmentResponseBuilder builder = AppointmentResponse.builder()
                .appointmentId(appointment.getAppointmentId())
                .doctor(appointment.getDoctor())
                .specialty(appointment.getSpecialty())
                .service(appointment.getService())
                .reasonForVisit(appointment.getReasonForVisit())
                .statusAppointement(appointment.getStatusAppointement())
                .meetingLink(appointment.getMeetingLink());

        if (appointment.getUser() != null) {
            builder.userId(appointment.getUser().getUserId());
            builder.patientName(appointment.getUser().getName());
        }

        if (appointment.getSchedule() != null) {
            builder.scheduleId(appointment.getSchedule().getScheduleId());
            if (appointment.getSchedule().getDate() != null)
                builder.scheduleDate(appointment.getSchedule().getDate().toString());
            if (appointment.getSchedule().getStartTime() != null)
                builder.scheduleTime(appointment.getSchedule().getStartTime().toString());
        }

        return builder.build();
    }

    // ── List<Appointment> → List<AppointmentResponse> ────────────────────────

    public List<AppointmentResponse> toResponseList(List<Appointment> appointments) {
        return appointments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Update entity in-place ───────────────────────────────────────────────

    public void updateEntityFromRequest(AppointmentRequest request, Appointment appointment) {
        appointment.setDoctor(request.getDoctor());
        appointment.setSpecialty(request.getSpecialty());
        appointment.setService(request.getService());
        appointment.setReasonForVisit(request.getReasonForVisit());
        if (request.getStatusAppointement() != null) {
            try {
                appointment.setStatusAppointement(
                        StatusAppointement.valueOf(request.getStatusAppointement().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }
    }

    // ── Schedule → Entity ────────────────────────────────────────────────────

    public Schedule toScheduleEntity(ScheduleRequest request) {
        return Schedule.builder()
                .date(request.getDate())
                .startTime(request.getStartTime())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .build();
    }

    // ── Schedule → Response ──────────────────────────────────────────────────

    public ScheduleResponse toScheduleResponse(Schedule schedule) {
        ScheduleResponse.ScheduleResponseBuilder builder = ScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .date(schedule.getDate())
                .startTime(schedule.getStartTime())
                .isAvailable(schedule.getIsAvailable());

        if (schedule.getDoctor() != null) {
            builder.doctorId(schedule.getDoctor().getUserId());
            builder.doctorName(schedule.getDoctor().getName());
        }

        return builder.build();
    }

    // ── List<Schedule> → List<ScheduleResponse> ──────────────────────────────

    public List<ScheduleResponse> toScheduleResponseList(List<Schedule> schedules) {
        return schedules.stream()
                .map(this::toScheduleResponse)
                .collect(Collectors.toList());
    }

    // ── Teleconsultation ────────────────────────────────────────────────────

    public Teleconsultation toTeleconsultationEntity(TeleconsultationRequest request) {
        return Teleconsultation.builder()
                .notes(request.getNotes())
                .build();
    }

    public TeleconsultationResponse toTeleconsultationResponse(Teleconsultation t) {
        TeleconsultationResponse.TeleconsultationResponseBuilder builder = TeleconsultationResponse.builder()
                .id(t.getId())
                .notes(t.getNotes())
                .roomUrl(t.getRoomUrl())
                .startDateTime(t.getStartDateTime())
                .endDateTime(t.getEndDateTime());

        if (t.getAppointment() != null)
            builder.appointmentId(t.getAppointment().getAppointmentId());

        if (t.getConsultationRoom() != null) {
            builder.roomId(t.getConsultationRoom().getRoomId());
            builder.roomCode(t.getConsultationRoom().getRoomCode());
        }

        return builder.build();
    }

    public List<TeleconsultationResponse> toTeleconsultationResponseList(List<Teleconsultation> list) {
        return list.stream().map(this::toTeleconsultationResponse).collect(Collectors.toList());
    }

    // ── ConsultationRoom ────────────────────────────────────────────────────

    public ConsultationRoom toConsultationRoomEntity(ConsultationRoomRequest request) {
        return ConsultationRoom.builder()
                .expiresAt(request.getExpiresAt())
                .build();
    }

    public ConsultationRoomResponse toConsultationRoomResponse(ConsultationRoom room) {
        return ConsultationRoomResponse.builder()
                .roomId(room.getRoomId())
                .roomCode(room.getRoomCode())
                .createdAt(room.getCreatedAt())
                .expiresAt(room.getExpiresAt())
                .build();
    }

    public List<ConsultationRoomResponse> toConsultationRoomResponseList(List<ConsultationRoom> rooms) {
        return rooms.stream().map(this::toConsultationRoomResponse).collect(Collectors.toList());
    }
}