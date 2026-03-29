package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.pi.tbibi.entities.OrderLine;

import java.util.List;

public interface OrderLineRepository extends JpaRepository<OrderLine,Long> {
    @Query("SELECT ol FROM OrderLine ol LEFT JOIN FETCH ol.medicine WHERE ol.order.orderId = :orderId")
    List<OrderLine> findByOrderIdWithMedicine(@Param("orderId") Long orderId);
}
