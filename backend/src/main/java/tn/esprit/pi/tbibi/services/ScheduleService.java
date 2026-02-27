package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.ScheduleRequest;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.Mapper.IAppointementMapper;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService implements IScheduleService {

    private final ScheduleRepo scheduleRepo;
    private final IAppointementMapper mapper;

    @Override
    public ScheduleResponse create(ScheduleRequest request) {

        Schedule schedule = mapper.toScheduleEntity(request);
        return mapper.toScheduleResponse(scheduleRepo.save(schedule));
    }
    @Override
    public ScheduleResponse getById(Integer id) {
        return mapper.toScheduleResponse(findById(id));
    }

    @Override
    public List<ScheduleResponse> getAll() {
        return mapper.toScheduleResponseList(scheduleRepo.findAll());
    }

    @Override
    public ScheduleResponse update(Integer id, ScheduleRequest request) {
        Schedule schedule = findById(id);

        schedule.setDate(request.getDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setIsAvailable(request.getIsAvailable());
        return mapper.toScheduleResponse(scheduleRepo.save(schedule));
    }

    @Override
    public void delete(Integer id) {
        findById(id); // will throw if not found
        scheduleRepo.deleteById(Long.valueOf(id));
    }

    private Schedule findById(Integer id) {
        return scheduleRepo.findById(Long.valueOf(id))
                .orElseThrow(() -> new EntityNotFoundException(
                        "Schedule not found with id: " + id));
    }
}
