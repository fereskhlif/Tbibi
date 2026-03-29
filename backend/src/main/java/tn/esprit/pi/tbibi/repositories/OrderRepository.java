package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Order;
import tn.esprit.pi.tbibi.entities.Status;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order,Long> {
    List<Order> findByUser_UserId(Integer userId);
    List<Order> findByOrderStatus(Status status);
    List<Order> findByPharmacy_PharmacyId(Long pharmacyId);
}
