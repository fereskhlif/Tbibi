package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.entities.Schedule;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepo extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDate(LocalDate date);

    List<Schedule> findByDoctorUserIdAndIsAvailableTrue(int doctorId);

    List<Schedule> findByDoctorUserId(int doctorId);

    List<Schedule> findByDoctorUserIdAndDate(int doctorId, LocalDate date);

    /** Slots for a doctor from a given date onwards (today+) — used for the doctor's schedule view */
    List<Schedule> findByDoctorUserIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(int doctorId, LocalDate from);

    /** All free slots from today onwards (for all doctors) — used by AI chat context */
    @Query("SELECT s FROM Schedule s WHERE s.isAvailable = true AND s.date >= :today ORDER BY s.date ASC, s.startTime ASC")
    List<Schedule> findAllAvailableFromToday(@Param("today") LocalDate today);

    /**
     * Delete all AVAILABLE slots for a doctor that are NOT referenced by any appointment.
     * Slots already booked (FK constraint) are intentionally left untouched.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM Schedule s WHERE s.doctor.userId = :doctorId AND s.isAvailable = true "
         + "AND NOT EXISTS (SELECT 1 FROM Appointment a WHERE a.schedule = s)")
    void deleteAvailableUnbookedByDoctorId(@Param("doctorId") int doctorId);

    /**
     * Same as above but scoped to a specific date.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM Schedule s WHERE s.doctor.userId = :doctorId AND s.date = :date AND s.isAvailable = true "
         + "AND NOT EXISTS (SELECT 1 FROM Appointment a WHERE a.schedule = s)")
    void deleteAvailableUnbookedByDoctorIdAndDate(@Param("doctorId") int doctorId, @Param("date") LocalDate date);
}
