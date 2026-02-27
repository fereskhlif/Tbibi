package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Schedule;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepo extends JpaRepository<Schedule,Long> {
    List<Schedule> findByDate(LocalDate date);
    List<Schedule> findByDocteurIsAvailable(String docteur ,Boolean isAvailable);
}
