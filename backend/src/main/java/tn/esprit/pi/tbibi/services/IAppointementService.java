package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.AppointmentRequest;
import tn.esprit.pi.tbibi.DTO.AppointmentResponse;

import java.util.List;

public interface IAppointementService {
    AppointmentResponse create(AppointmentRequest request);

    AppointmentResponse getById(Integer id);

    List<AppointmentResponse> getAll();

    List<AppointmentResponse> getByScheduleId(Integer scheduleId);

    AppointmentResponse update(Integer id, AppointmentRequest request);

    void delete(Integer id);
}
