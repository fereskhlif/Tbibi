package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.Prescription;

@Repository
public interface PrescriptionRepo extends JpaRepository<Prescription, Integer> {
    java.util.List<Prescription> findByExpirationDateIsNotNull();

    /**
     * Finds all prescriptions linked to a given patient via subquery:
     * User.medicalFiles → MedicalReccords → Acte → Prescription
     */
    @Query("SELECT p FROM Prescription p " +
           "JOIN p.acte a " +
           "JOIN a.medicalFile mf " +
           "WHERE mf.medicalfile_id IN (" +
           "  SELECT mf2.medicalfile_id FROM User u JOIN u.medicalFiles mf2 WHERE u.userId = :patientId" +
           ") ORDER BY p.date DESC")
    java.util.List<Prescription> findByPatientId(@Param("patientId") Integer patientId);
}


