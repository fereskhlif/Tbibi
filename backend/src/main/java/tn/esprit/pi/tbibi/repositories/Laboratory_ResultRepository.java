package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;
import java.util.List;

@Repository
public interface Laboratory_ResultRepository extends JpaRepository<Laboratory_Result, Integer> {

    List<Laboratory_Result> findByPatient_UserId(Integer patientId);
}