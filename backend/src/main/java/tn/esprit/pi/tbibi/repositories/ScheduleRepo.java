package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.entities.Schedule;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepo extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDate(LocalDate date);

    List<Schedule> findByDoctorUserIdAndIsAvailableTrue(int doctorId);

    List<Schedule> findByDoctorUserId(int doctorId);

    List<Schedule> findByDoctorUserIdAndDate(int doctorId, LocalDate date);

    @Modifying
    @Transactional
    void deleteByDoctorUserIdAndIsAvailableTrue(int doctorId);

    @Modifying
    @Transactional
    void deleteByDoctorUserIdAndDateAndIsAvailableTrue(int doctorId, LocalDate date);
}
