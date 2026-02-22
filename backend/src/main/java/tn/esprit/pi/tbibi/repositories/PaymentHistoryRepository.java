package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.PaymentHistory;

public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory,Long> {
}
