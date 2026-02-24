package tn.esprit.pi.tbibi.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.DTO.ScheduleRequest;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.entities.Schedule;

import java.util.List;

@Mapper(componentModel = "spring")
public interface IAppointementMapper {
    Appointment toEntity(AppointmentRequest appointmentRequest);
    AppointmentResponse toResponse(Appointment appointment);
    List<AppointmentResponse> toResponseList(List<Appointment> appointments);
    void updateEntityFromRequest(AppointmentRequest request,@MappingTarget Appointment appointment);
    Schedule toScheduleEntity(ScheduleRequest request);
    ScheduleResponse toScheduleResponse(Schedule schedule);
    List<ScheduleResponse> toScheduleResponseList(List<Schedule> schedules);

}
