package tn.esprit.pi.tbibi.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import tn.esprit.pi.tbibi.DTO.*;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.ConsultationRoom;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.Teleconsultation;

import java.util.List;

@Mapper(componentModel = "spring")
public interface IAppointementMapper {
    // Appointment
    Appointment toEntity(AppointmentRequest appointmentRequest);

    @org.mapstruct.Mapping(source = "user.userId", target = "userId")
    @org.mapstruct.Mapping(source = "patientName", target = "patientName")
    @org.mapstruct.Mapping(source = "schedule.scheduleId", target = "scheduleId")
    @org.mapstruct.Mapping(source = "schedule.date", target = "scheduleDate")
    @org.mapstruct.Mapping(source = "schedule.startTime", target = "scheduleTime")
    AppointmentResponse toResponse(Appointment appointment);

    List<AppointmentResponse> toResponseList(List<Appointment> appointments);

    void updateEntityFromRequest(AppointmentRequest request, @MappingTarget Appointment appointment);

    // Schedule
    Schedule toScheduleEntity(ScheduleRequest request);

    @org.mapstruct.Mapping(source = "doctor.userId", target = "doctorId")
    @org.mapstruct.Mapping(source = "doctor.name", target = "doctorName")
    ScheduleResponse toScheduleResponse(Schedule schedule);

    List<ScheduleResponse> toScheduleResponseList(List<Schedule> schedules);

    // Teleconsultation
    Teleconsultation toTeleconsultationEntity(TeleconsultationRequest request);

    TeleconsultationResponse toTeleconsultationResponse(Teleconsultation teleconsultation);

    List<TeleconsultationResponse> toTeleconsultationResponseList(List<Teleconsultation> list);

    // ConsultationRoom
    ConsultationRoom toConsultationRoomEntity(ConsultationRoomRequest request);

    ConsultationRoomResponse toConsultationRoomResponse(ConsultationRoom room);

    List<ConsultationRoomResponse> toConsultationRoomResponseList(List<ConsultationRoom> rooms);
}
