package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Teleconsultation;

import java.util.Optional;

public interface TeleconsultationRepo extends JpaRepository<Teleconsultation, Integer> {
    Optional<Teleconsultation> findByAppointmentAppointmentId(Long appointmentId);
}
