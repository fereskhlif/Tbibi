package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.esprit.pi.tbibi.entities.Acte;

import java.util.List;

public interface ActeRepo extends JpaRepository<Acte,Integer> {
    @Query("SELECT a FROM Acte a LEFT JOIN FETCH a.medicalFile WHERE a.acteId = a.acteId")
    List<Acte> findAllWithMedicalFile();
}
