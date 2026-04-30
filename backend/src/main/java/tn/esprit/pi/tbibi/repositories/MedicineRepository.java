package tn.esprit.pi.tbibi.repositories;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.esprit.pi.tbibi.entities.Medicine;

import java.util.Date;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine,Long> {
    List<Medicine> findByStockLessThan(int stock);
    List<Medicine> findByDateOfExpirationBefore(Date date);
    List<Medicine> findByMedicineNameContaining(String name);
    List<Medicine> findByAvailableTrue();
    List<Medicine> findByPharmacy_PharmacyIdAndAvailableTrue(Long pharmacyId);
    @Query("SELECT m.medicineName FROM Medicine m WHERE m.stock > :stock AND m.available = true")
    List<String> findAvailableMedicineNames(int stock);

    @Query("SELECT m.activeIngredient FROM Medicine m WHERE m.stock > :stock AND m.available = true AND m.activeIngredient IS NOT NULL")
    List<String> findAvailableMolecules(int stock);

    // ─── PAGINATED ───
    Page<Medicine> findByAvailableTrue(Pageable pageable);
    Page<Medicine> findByPharmacy_PharmacyIdAndAvailableTrue(Long pharmacyId, Pageable pageable);
    Page<Medicine> findByMedicineNameContainingIgnoreCaseAndAvailableTrue(String name, Pageable pageable);
    Page<Medicine> findByMedicineNameContainingIgnoreCaseAndPharmacy_PharmacyIdAndAvailableTrue(String name, Long pharmacyId, Pageable pageable);
}
