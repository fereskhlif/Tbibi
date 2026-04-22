package tn.esprit.pi.tbibi.repositories;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Medicine;

import java.util.Date;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.pi.tbibi.entities.MedicineCategory;

public interface MedicineRepository extends JpaRepository<Medicine,Long> {
    List<Medicine> findByStockLessThan(int stock);
    List<Medicine> findByDateOfExpirationBefore(Date date);
    List<Medicine> findByDateOfExpirationBeforeAndAvailableTrue(Date date);
    List<Medicine> findByMedicineNameContaining(String name);
    List<Medicine> findByAvailableTrue();
    List<Medicine> findByPharmacy_PharmacyIdAndAvailableTrue(Long pharmacyId);

    // ─── PAGINATED ───
    Page<Medicine> findByAvailableTrue(Pageable pageable);
    Page<Medicine> findByPharmacy_PharmacyIdAndAvailableTrue(Long pharmacyId, Pageable pageable);
    Page<Medicine> findByMedicineNameContainingIgnoreCaseAndAvailableTrue(String name, Pageable pageable);
    Page<Medicine> findByMedicineNameContainingIgnoreCaseAndPharmacy_PharmacyIdAndAvailableTrue(String name, Long pharmacyId, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE m.available = true " +
           "AND (:name IS NULL OR LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:pharmacyId IS NULL OR m.pharmacy.pharmacyId = :pharmacyId) " +
           "AND (:category IS NULL OR m.category = :category) " +
           "AND (:inStockOnly = false OR m.stock > 0)")
    Page<Medicine> searchAndFilter(
           @Param("name") String name, 
           @Param("pharmacyId") Long pharmacyId, 
           @Param("category") MedicineCategory category, 
           @Param("inStockOnly") boolean inStockOnly, 
           Pageable pageable);

    @Query("SELECT m.medicineName, SUM(ol.quantity) as totalQty " +
           "FROM OrderLine ol " +
           "JOIN ol.medicine m " +
           "JOIN ol.order o " +
           "WHERE m.pharmacy.pharmacyId = :pharmacyId AND o.orderStatus = 'DELIVERED' " +
           "GROUP BY m.medicineName " +
           "ORDER BY totalQty DESC")
    List<Object[]> findTopSellingMedicinesForPharmacy(@Param("pharmacyId") Long pharmacyId);
}
