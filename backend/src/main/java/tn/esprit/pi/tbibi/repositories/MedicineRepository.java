package tn.esprit.pi.tbibi.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Medicine;

import java.util.Date;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine,Long> {
    List<Medicine> findByStockLessThan(int stock);
    List<Medicine> findByDateOfExpirationBefore(Date date);
    List<Medicine> findByMedicineNameContaining(String name);
    List<Medicine> findByAvailableTrue();
}
