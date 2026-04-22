package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Order;
import tn.esprit.pi.tbibi.entities.Status;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order,Long> {
    List<Order> findByUser_UserId(Integer userId);
    List<Order> findByOrderStatus(Status status);
    List<Order> findByPharmacy_PharmacyId(Long pharmacyId);
    List<Order> findByPharmacy_PharmacyIdAndUser_EmailOrderByOrderDateDesc(Long pharmacyId, String email);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.pharmacy.pharmacyId = :pharmacyId " +
           "AND (:status IS NULL OR o.orderStatus = :status) " +
           "AND (:search IS NULL OR LOWER(o.user.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "                     OR LOWER(o.user.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "                     OR CAST(o.orderId AS string) LIKE CONCAT('%', :search, '%'))")
    org.springframework.data.domain.Page<Order> searchOrdersPaginated(
            @org.springframework.data.repository.query.Param("pharmacyId") Long pharmacyId,
            @org.springframework.data.repository.query.Param("status") Status status,
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.user.userId = :userId " +
           "AND (:status IS NULL OR o.orderStatus = :status) " +
           "AND (:search IS NULL OR LOWER(o.pharmacy.pharmacyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "                     OR CAST(o.orderId AS string) LIKE CONCAT('%', :search, '%'))")
    org.springframework.data.domain.Page<Order> searchUserOrdersPaginated(
            @org.springframework.data.repository.query.Param("userId") Integer userId,
            @org.springframework.data.repository.query.Param("status") Status status,
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);
}
