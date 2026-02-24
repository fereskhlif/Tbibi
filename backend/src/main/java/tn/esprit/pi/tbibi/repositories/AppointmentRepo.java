package tn.esprit.pi.tbibi.repositories;


import org.springframework.data.jpa.repository.JpaRepository;

import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.StatusAppointement;

import java.util.List;

public interface AppointmentRepo extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByDoctor(String doctor);
    List<Appointment> findByStatusAppointement(StatusAppointement status);
    List<Appointment> findByScheduleScheduleId(Integer scheduleId);
}
