package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.MedicalReccords;

import java.util.List;

@Repository
public interface MedicalReccordsRepo extends JpaRepository<MedicalReccords, Integer> {

    /** Search medical records whose linked patient name contains the keyword (case-insensitive). */
    @Query(value = "SELECT mr.* FROM medical_reccords mr " +
            "INNER JOIN users u ON u.user_id = mr.patient_id " +
            "WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))",
            nativeQuery = true)
    List<MedicalReccords> searchByPatientName(@Param("name") String name);
}
