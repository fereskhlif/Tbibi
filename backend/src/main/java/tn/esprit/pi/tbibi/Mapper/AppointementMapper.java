package tn.esprit.pi.tbibi.Mapper;

<<<<<<< HEAD
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;
import tn.esprit.pi.tbibi.DTO.ScheduleRequest;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.Schedule;
=======
import tn.esprit.pi.tbibi.DTO.*;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.ConsultationRoom;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.StatusAppointement;
import tn.esprit.pi.tbibi.entities.Teleconsultation;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6

import java.util.List;
import java.util.stream.Collectors;

<<<<<<< HEAD
=======
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
@Component
@Primary
public class AppointementMapper implements IAppointementMapper {

    // ── Appointment → Entity ─────────────────────────────────────────────────

<<<<<<< HEAD
    @Override
    public Appointment toEntity(AppointmentRequest request) {
=======
    public Appointment toEntity(AppointmentRequest request) {
        StatusAppointement status = StatusAppointement.PENDING;
        if (request.getStatusAppointement() != null) {
            try {
                status = StatusAppointement.valueOf(request.getStatusAppointement().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
        return Appointment.builder()
                .doctor(request.getDoctor())
                .specialty(request.getSpecialty())
                .service(request.getService())
                .reasonForVisit(request.getReasonForVisit())
<<<<<<< HEAD
                .statusAppointement(request.getStatus())
                // schedule is injected by the service after DB lookup
=======
                .statusAppointement(status)
                // schedule and user are injected by the service after DB lookup
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
                .build();
    }

    // ── Appointment → Response ───────────────────────────────────────────────

<<<<<<< HEAD
    @Override
    public AppointmentResponse toResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .appointmentId(Math.toIntExact(appointment.getAppointmentId()))
=======
    public AppointmentResponse toResponse(Appointment appointment) {
        AppointmentResponse.AppointmentResponseBuilder builder = AppointmentResponse.builder()
                .appointmentId(appointment.getAppointmentId())
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
                .doctor(appointment.getDoctor())
                .specialty(appointment.getSpecialty())
                .service(appointment.getService())
                .reasonForVisit(appointment.getReasonForVisit())
<<<<<<< HEAD
                .status(appointment.getStatusAppointement())
                .scheduleId(appointment.getSchedule().getScheduleId())
                .scheduleDate(appointment.getSchedule().getDate().toString())
                .scheduleTime(appointment.getSchedule().getStartTime().toString())
                .build();
=======
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
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    }

    // ── List<Appointment> → List<AppointmentResponse> ────────────────────────

<<<<<<< HEAD
    @Override
=======
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    public List<AppointmentResponse> toResponseList(List<Appointment> appointments) {
        return appointments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Update entity in-place ───────────────────────────────────────────────

<<<<<<< HEAD
    @Override
=======
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    public void updateEntityFromRequest(AppointmentRequest request, Appointment appointment) {
        appointment.setDoctor(request.getDoctor());
        appointment.setSpecialty(request.getSpecialty());
        appointment.setService(request.getService());
        appointment.setReasonForVisit(request.getReasonForVisit());
<<<<<<< HEAD
        appointment.setStatusAppointement(request.getStatus());
        // schedule is updated by the service after DB lookup
=======
        if (request.getStatusAppointement() != null) {
            try {
                appointment.setStatusAppointement(
                        StatusAppointement.valueOf(request.getStatusAppointement().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    }

    // ── Schedule → Entity ────────────────────────────────────────────────────

<<<<<<< HEAD
    @Override
=======
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    public Schedule toScheduleEntity(ScheduleRequest request) {
        return Schedule.builder()
                .date(request.getDate())
                .startTime(request.getStartTime())
<<<<<<< HEAD
                .isAvailable(request.getIsAvailable())
=======
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
                .build();
    }

    // ── Schedule → Response ──────────────────────────────────────────────────

<<<<<<< HEAD
    @Override
    public ScheduleResponse toScheduleResponse(Schedule schedule) {
        return ScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .date(schedule.getDate())
                .startTime(schedule.getStartTime())
                .isAvailable(schedule.getIsAvailable())
                .build();
=======
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
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    }

    // ── List<Schedule> → List<ScheduleResponse> ──────────────────────────────

<<<<<<< HEAD
    @Override
=======
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    public List<ScheduleResponse> toScheduleResponseList(List<Schedule> schedules) {
        return schedules.stream()
                .map(this::toScheduleResponse)
                .collect(Collectors.toList());
    }
<<<<<<< HEAD
=======

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
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
}