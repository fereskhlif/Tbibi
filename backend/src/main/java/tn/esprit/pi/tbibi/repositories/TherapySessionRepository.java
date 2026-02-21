package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.TherapySession;
import java.util.List;

@Repository
public interface TherapySessionRepository extends JpaRepository<TherapySession, Integer> {

    List<TherapySession> findByPatient_UserId(Integer patientId);

    List<TherapySession> findByPhysiotherapist_UserId(Integer physiotherapistId);
}