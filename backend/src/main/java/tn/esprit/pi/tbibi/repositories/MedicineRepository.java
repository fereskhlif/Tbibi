package tn.esprit.pi.tbibi.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Medicine;

public interface MedicineRepository extends JpaRepository<Medicine,Long> {
}
