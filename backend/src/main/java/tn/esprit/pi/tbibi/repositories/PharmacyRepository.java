package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Pharmacy;

public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {
}
