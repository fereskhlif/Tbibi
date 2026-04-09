package tn.esprit.pi.tbibi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.DTO.DoctorExceptionRequest;
import tn.esprit.pi.tbibi.DTO.DoctorExceptionResponse;
import tn.esprit.pi.tbibi.entities.DoctorException;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.DoctorExceptionRepo;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorExceptionService implements IDoctorExceptionService {

    private final DoctorExceptionRepo exceptionRepo;
    private final ScheduleRepo scheduleRepo;
    private final UserRepo userRepo;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    @Transactional
    public DoctorExceptionResponse addException(DoctorExceptionRequest request) {
        User doctor = userRepo.findById(request.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + request.getDoctorId()));

        LocalDate date = LocalDate.parse(request.getDate(), DATE_FMT);
        LocalTime fromTime = (request.getFromTime() != null && !request.getFromTime().isBlank())
                ? LocalTime.parse(request.getFromTime(), TIME_FMT) : null;
        LocalTime toTime = (request.getToTime() != null && !request.getToTime().isBlank())
                ? LocalTime.parse(request.getToTime(), TIME_FMT) : null;

        DoctorException exception = DoctorException.builder()
                .doctor(doctor)
                .date(date)
                .fromTime(fromTime)
                .toTime(toTime)
                .build();

        exceptionRepo.save(exception);

        // Mark affected schedule slots as unavailable
        List<Schedule> slots = scheduleRepo.findByDoctorUserIdAndDate(request.getDoctorId(), date);
        for (Schedule slot : slots) {
            if (isSlotBlocked(slot.getStartTime(), fromTime, toTime)) {
                slot.setIsAvailable(false);
            }
        }
        scheduleRepo.saveAll(slots);

        return toResponse(exception);
    }

    @Override
    public List<DoctorExceptionResponse> getExceptions(Integer doctorId) {
        return exceptionRepo.findByDoctorUserId(doctorId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteException(Long id) {
        DoctorException exception = exceptionRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Exception not found: " + id));

        LocalDate date = exception.getDate();
        int doctorId = exception.getDoctor().getUserId();
        LocalTime fromTime = exception.getFromTime();
        LocalTime toTime = exception.getToTime();

        exceptionRepo.deleteById(id);

        // Restore affected slots that are not booked (isAvailable = false but not booked)
        // We check if there are no OTHER exceptions still blocking those slots
        List<DoctorException> remaining = exceptionRepo.findByDoctorUserIdAndDate(doctorId, date);

        List<Schedule> slots = scheduleRepo.findByDoctorUserIdAndDate(doctorId, date);
        for (Schedule slot : slots) {
            // Was this slot blocked by the deleted exception?
            if (isSlotBlocked(slot.getStartTime(), fromTime, toTime)) {
                // Check if any remaining exception still blocks it
                boolean stillBlocked = remaining.stream()
                        .anyMatch(ex -> isSlotBlocked(slot.getStartTime(), ex.getFromTime(), ex.getToTime()));
                if (!stillBlocked) {
                    slot.setIsAvailable(true);
                }
            }
        }
        scheduleRepo.saveAll(slots);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Returns true if the slot's start time falls within the blocked window.
     * If fromTime/toTime are null → whole day is blocked.
     */
    private boolean isSlotBlocked(LocalTime slotStart, LocalTime fromTime, LocalTime toTime) {
        if (fromTime == null || toTime == null) {
            // Whole day blocked
            return true;
        }
        // Slot is blocked if it starts before the window ends AND starts at or after the window starts
        return !slotStart.isBefore(fromTime) && slotStart.isBefore(toTime);
    }

    private DoctorExceptionResponse toResponse(DoctorException e) {
        boolean wholeDay = (e.getFromTime() == null || e.getToTime() == null);
        return DoctorExceptionResponse.builder()
                .id(e.getId())
                .doctorId(e.getDoctor().getUserId())
                .date(e.getDate().format(DATE_FMT))
                .fromTime(wholeDay ? null : e.getFromTime().format(TIME_FMT))
                .toTime(wholeDay ? null : e.getToTime().format(TIME_FMT))
                .wholeDay(wholeDay)
                .build();
    }
}
