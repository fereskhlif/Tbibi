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

    // ── CREATE ───────────────────────────────────────────────────────────────

    @Override
    public ScheduleResponse create(ScheduleRequest request) {
        // 1. Map DTO → entity
        Schedule schedule = mapper.toScheduleEntity(request);

        // 2. Persist and return mapped response
        return mapper.toScheduleResponse(scheduleRepo.save(schedule));
    }

    // ── READ ONE ─────────────────────────────────────────────────────────────

    @Override
    public ScheduleResponse getById(Integer id) {
        return mapper.toScheduleResponse(findById(id));
    }

    // ── READ ALL ─────────────────────────────────────────────────────────────

    @Override
    public List<ScheduleResponse> getAll() {
        return mapper.toScheduleResponseList(scheduleRepo.findAll());
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────

    @Override
    public ScheduleResponse update(Integer id, ScheduleRequest request) {
        // 1. Fetch existing entity
        Schedule schedule = findById(id);

        // 2. Apply new values
        schedule.setDate(request.getDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setIsAvailable(request.getIsAvailable());

        // 3. Persist and return mapped response
        return mapper.toScheduleResponse(scheduleRepo.save(schedule));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    @Override
    public void delete(Integer id) {
        findById(id); // will throw if not found
        scheduleRepo.deleteById(Long.valueOf(id));
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Schedule findById(Integer id) {
        return scheduleRepo.findById(Long.valueOf(id))
                .orElseThrow(() -> new EntityNotFoundException(
                        "Schedule not found with id: " + id));
    }
}
