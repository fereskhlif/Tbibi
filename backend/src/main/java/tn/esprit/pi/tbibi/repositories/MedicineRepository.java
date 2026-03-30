package tn.esprit.pi.tbibi.repositories;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Medicine;

import java.util.Date;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine,Long> {
    List<Medicine> findByStockLessThan(int stock);
    List<Medicine> findByDateOfExpirationBefore(Date date);
    List<Medicine> findByMedicineNameContaining(String name);
    List<Medicine> findByAvailableTrue();
    List<Medicine> findByPharmacy_PharmacyIdAndAvailableTrue(Long pharmacyId);

    // ─── PAGINATED ───
    Page<Medicine> findByAvailableTrue(Pageable pageable);
    Page<Medicine> findByPharmacy_PharmacyIdAndAvailableTrue(Long pharmacyId, Pageable pageable);
    Page<Medicine> findByMedicineNameContainingIgnoreCaseAndAvailableTrue(String name, Pageable pageable);
    Page<Medicine> findByMedicineNameContainingIgnoreCaseAndPharmacy_PharmacyIdAndAvailableTrue(String name, Long pharmacyId, Pageable pageable);
}
