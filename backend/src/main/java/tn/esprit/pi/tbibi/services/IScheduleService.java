package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.ScheduleRequest;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;

import java.util.List;

public interface IScheduleService {

    ScheduleResponse create(ScheduleRequest request);
    ScheduleResponse getById(Integer id);
    List<ScheduleResponse> getAll();
    ScheduleResponse update(Integer id, ScheduleRequest request);
    void delete(Integer id);
}
