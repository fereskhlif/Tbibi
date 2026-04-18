package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.pi.tbibi.entities.Acte;
import tn.esprit.pi.tbibi.entities.PrescriptionStatus;

import java.util.Date;
import java.util.List;

public interface ActeRepo extends JpaRepository<Acte,Integer> {
    @Query("SELECT DISTINCT a FROM Acte a " +
           "LEFT JOIN FETCH a.medicalFile mf " +
           "LEFT JOIN FETCH a.prescriptions p " +
           "WHERE a.acteId IS NOT NULL")
    List<Acte> findAllWithMedicalFile();
    @Query("SELECT DISTINCT a FROM Acte a " +
            "LEFT JOIN FETCH a.medicalFile mf " +
            "JOIN a.prescriptions p " +
            "WHERE p.expirationDate IS NOT NULL " +
            "AND mf.medicalfile_id = :medicalFileId")
    List<Acte> findActesWithActivePrescriptionByMedicalFile(
            @Param("medicalFileId") Integer medicalFileId
    );
    // Complex Spring Data JPA derived query (using keywords) involving more than one table
    List<Acte> findByTypeOfActeAndPrescriptions_StatusAndDateAfter(
            String typeOfActe,
            PrescriptionStatus status,
            Date date
    );
}
