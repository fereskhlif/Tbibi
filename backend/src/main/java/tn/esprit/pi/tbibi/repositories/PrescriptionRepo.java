package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.Prescription;
@Repository
public interface PrescriptionRepo extends JpaRepository<Prescription,Integer> {

}
