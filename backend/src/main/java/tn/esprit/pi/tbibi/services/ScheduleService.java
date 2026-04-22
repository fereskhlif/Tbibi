package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.DTO.ScheduleRequest;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.DTO.UnavailabilityWindow;
import tn.esprit.pi.tbibi.DTO.WorkScheduleRequest;
import tn.esprit.pi.tbibi.Mapper.IAppointementMapper;
import tn.esprit.pi.tbibi.entities.DoctorException;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.DoctorExceptionRepo;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService implements IScheduleService {

    private final ScheduleRepo scheduleRepo;
    private final UserRepo userRepo;
    private final IAppointementMapper mapper;
    private final DoctorExceptionRepo exceptionRepo;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // ─── Existing CRUD ───────────────────────────────────────────────────────────

    @Override
    public ScheduleResponse create(ScheduleRequest request) {
        if (request.getDate() != null && request.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot create a schedule slot in the past.");
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

    // ─── Generate year slots ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<ScheduleResponse> generateYearSlots(WorkScheduleRequest request) {
        User doctor = findDoctorById(request.getDoctorId());

        // Parse work hours
        LocalTime workStart = LocalTime.parse(request.getWorkStart(), TIME_FMT);
        LocalTime workEnd   = LocalTime.parse(request.getWorkEnd(), TIME_FMT);
        int durationMins    = request.getConsultationMinutes();

        // Build rest-days set
        Set<DayOfWeek> restDays = request.getRestDays() == null ? Set.of() :
                request.getRestDays().stream()
                        .map(DayOfWeek::valueOf)
                        .collect(Collectors.toSet());

        // Build recurring unavailability windows
        List<LocalTime[]> dailyBlocks = new ArrayList<>();
        if (request.getUnavailableWindows() != null) {
            for (UnavailabilityWindow w : request.getUnavailableWindows()) {
                if (w.getFrom() != null && w.getTo() != null) {
                    dailyBlocks.add(new LocalTime[]{
                            LocalTime.parse(w.getFrom(), TIME_FMT),
                            LocalTime.parse(w.getTo(), TIME_FMT)
                    });
                }
            }
        }

        // Date range: today → Dec 31 of current year
        LocalDate today   = LocalDate.now();
        LocalDate yearEnd = LocalDate.of(today.getYear(), 12, 31);

        // Load date-specific exceptions for this doctor once
        List<DoctorException> exceptions = exceptionRepo.findByDoctorUserId(request.getDoctorId());

        // Load all EXISTING slots for this doctor to detect duplicates efficiently
        Set<String> existingKeys = scheduleRepo.findByDoctorUserId(request.getDoctorId())
                .stream()
                .map(s -> s.getDate() + "|" + s.getStartTime())
                .collect(Collectors.toSet());

        List<Schedule> slotsToSave = new ArrayList<>();

        for (LocalDate day = today; !day.isAfter(yearEnd); day = day.plusDays(1)) {
            // Skip rest days
            if (restDays.contains(day.getDayOfWeek())) continue;

            // Check whole-day exceptions for this date
            final LocalDate currentDay = day;
            boolean wholeDayBlocked = exceptions.stream()
                    .anyMatch(ex -> ex.getDate().equals(currentDay)
                            && ex.getFromTime() == null && ex.getToTime() == null);
            if (wholeDayBlocked) continue;

            // Collect partial-day exceptions for this date
            List<LocalTime[]> dayExceptions = exceptions.stream()
                    .filter(ex -> ex.getDate().equals(currentDay)
                            && ex.getFromTime() != null && ex.getToTime() != null)
                    .map(ex -> new LocalTime[]{ex.getFromTime(), ex.getToTime()})
                    .collect(Collectors.toList());

            // Loop through time slots
            LocalTime cursor = workStart;
            while (cursor.plusMinutes(durationMins).compareTo(workEnd) <= 0) {
                LocalTime slotEnd = cursor.plusMinutes(durationMins);

                // Check recurring daily blocks
                boolean blocked = isBlockedByAny(cursor, slotEnd, dailyBlocks);

                // Check date-specific exceptions
                if (!blocked) {
                    blocked = isBlockedByAny(cursor, slotEnd, dayExceptions);
                }

                // Skip if a slot already exists for this doctor/date/time (duplicate check)
                if (!blocked) {
                    String key = day + "|" + cursor;
                    if (!existingKeys.contains(key)) {
                        slotsToSave.add(Schedule.builder()
                                .doctor(doctor)
                                .date(day)
                                .startTime(cursor)
                                .isAvailable(true)
                                .build());
                        // Add to set so we don't insert it twice even within this same run
                        existingKeys.add(key);
                    }
                }

                cursor = cursor.plusMinutes(durationMins);
            }
        }

        List<Schedule> saved = scheduleRepo.saveAll(slotsToSave);
        return mapper.toScheduleResponseList(saved);
    }

    @Override
    @Transactional
    public void clearAvailableSlots(Integer doctorId) {
        scheduleRepo.deleteByDoctorUserIdAndIsAvailableTrue(doctorId);
    }

    @Override
    @Transactional
    public void clearAvailableSlotsByDate(Integer doctorId, LocalDate date) {
        scheduleRepo.deleteByDoctorUserIdAndDateAndIsAvailableTrue(doctorId, date);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────────

    /**
     * Returns true if [slotStart, slotEnd) overlaps any block in the list.
     * Overlap condition: slotStart < blockEnd AND slotEnd > blockStart
     */
    private boolean isBlockedByAny(LocalTime slotStart, LocalTime slotEnd, List<LocalTime[]> blocks) {
        for (LocalTime[] block : blocks) {
            if (slotStart.isBefore(block[1]) && slotEnd.isAfter(block[0])) {
                return true;
            }
        }
        return false;
    }

    private Schedule findById(Long id) {
        return scheduleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found: " + id));
    }

    private User findDoctorById(Integer doctorId) {
        return userRepo.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + doctorId));
    }
}
