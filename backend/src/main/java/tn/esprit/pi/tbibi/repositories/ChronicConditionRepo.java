package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.ChronicCondition;
import java.util.List;

public interface ChronicConditionRepo extends JpaRepository<ChronicCondition, Long> {
    List<ChronicCondition> findByPatientUserIdOrderByRecordedAtDesc(Integer patientId);
    List<ChronicCondition> findByDoctorUserIdOrderByRecordedAtDesc(Integer doctorId);
    List<ChronicCondition> findBySeverityAndDoctorUserId(String severity, Integer doctorId);
}
