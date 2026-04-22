package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.pi.tbibi.entities.ChronicCondition;

import java.time.LocalDateTime;
import java.util.List;

public interface ChronicConditionRepo extends JpaRepository<ChronicCondition, Long> {
       List<ChronicCondition> findByPatientUserIdOrderByRecordedAtDesc(Integer patientId);

       /** Delete all readings for a specific patient (used by the patient's "Clear History" action) */
       void deleteByPatientUserId(Integer patientId);

       /**
        * Load ALL readings (including smartwatch simulator data).
        * Eagerly fetches patient + their role so the service can filter non-patients.
        */
       @Query("SELECT c FROM ChronicCondition c LEFT JOIN FETCH c.patient p LEFT JOIN FETCH p.role")
       List<ChronicCondition> findAllWithPatient();

       List<ChronicCondition> findByDoctorUserIdOrderByRecordedAtDesc(Integer doctorId);

       List<ChronicCondition> findBySeverityAndDoctorUserId(String severity, Integer doctorId);

       @Query("SELECT c.patient.name, c.conditionType, AVG(c.value), MAX(c.recordedAt), c.severity " +
                     "FROM ChronicCondition c " +
                     "JOIN c.patient p " +
                     "JOIN c.doctor d " +
                     "WHERE d.userId = :doctorId AND p IS NOT NULL " +
                     "GROUP BY c.patient.name, c.conditionType, c.severity " +
                     "ORDER BY MAX(c.recordedAt) DESC")
       List<Object[]> findPatientHealthSummaryByDoctor(@Param("doctorId") Integer doctorId);

       List<ChronicCondition> findByDoctorUserIdAndSeverityAndRecordedAtAfterOrderByRecordedAtDesc(
                     Integer doctorId,
                     String severity,
                     LocalDateTime since);
}
