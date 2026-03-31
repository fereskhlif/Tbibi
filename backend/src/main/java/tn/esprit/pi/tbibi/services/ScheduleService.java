package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.ScheduleRequest;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.Mapper.IAppointementMapper;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService implements IScheduleService {

    private final ScheduleRepo scheduleRepo;
    private final UserRepo userRepo;
    private final IAppointementMapper mapper;

    @Override
    public ScheduleResponse create(ScheduleRequest request) {
        // Reject past dates
        if (request.getDate() != null && request.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot create a schedule slot in the past. Please choose today or a future date.");
        }
        User doctor = findDoctorById(request.getDoctorId().intValue());
        Schedule schedule = mapper.toScheduleEntity(request);
        schedule.setDoctor(doctor);
        return mapper.toScheduleResponse(scheduleRepo.save(schedule));
    }

    @Override
    public ScheduleResponse getById(Long id) {
        return mapper.toScheduleResponse(findById(id));
    }

    @Override
    public List<ScheduleResponse> getAll() {
        return mapper.toScheduleResponseList(scheduleRepo.findAll());
    }

    @Override
    public ScheduleResponse update(Long id, ScheduleRequest request) {
        Schedule schedule = findById(id);
        if (request.getDoctorId() != null) {
            schedule.setDoctor(findDoctorById(request.getDoctorId().intValue()));
        }
        schedule.setDate(request.getDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setIsAvailable(request.getIsAvailable());
        return mapper.toScheduleResponse(scheduleRepo.save(schedule));
    }

    @Override
    public void delete(Long id) {
        findById(id);
        scheduleRepo.deleteById(id);
    }

    @Override
    public List<ScheduleResponse> getByDoctorId(Integer doctorId) {
        return mapper.toScheduleResponseList(scheduleRepo.findByDoctorUserId(doctorId));
    }

    @Override
    public List<ScheduleResponse> getAvailableByDoctorId(Integer doctorId) {
        return mapper.toScheduleResponseList(scheduleRepo.findByDoctorUserIdAndIsAvailableTrue(doctorId));
    }

    @Override
    public List<ScheduleResponse> getByDoctorIdAndDate(Integer doctorId, LocalDate date) {
        return mapper.toScheduleResponseList(scheduleRepo.findByDoctorUserIdAndDate(doctorId, date));
    }

    private Schedule findById(Long id) {
        return scheduleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + id));
    }

    private User findDoctorById(Integer doctorId) {
        return userRepo.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + doctorId));
    }
}
