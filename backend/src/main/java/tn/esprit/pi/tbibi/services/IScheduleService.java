package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.ScheduleRequest;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;

import java.time.LocalDate;
import java.util.List;

public interface IScheduleService {

    ScheduleResponse create(ScheduleRequest request);

    ScheduleResponse getById(Long id);

    List<ScheduleResponse> getAll();

    ScheduleResponse update(Long id, ScheduleRequest request);

    void delete(Long id);

    List<ScheduleResponse> getByDoctorId(Integer doctorId);

    List<ScheduleResponse> getAvailableByDoctorId(Integer doctorId);

    List<ScheduleResponse> getByDoctorIdAndDate(Integer doctorId, LocalDate date);
}
