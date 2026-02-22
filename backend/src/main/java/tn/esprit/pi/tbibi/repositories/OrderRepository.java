package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Order;

public interface OrderRepository extends JpaRepository<Order,Long> {
}
