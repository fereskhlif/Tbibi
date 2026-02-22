package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.MonitoringOfChronicDisease;

public interface MonitoringRepository
        extends JpaRepository<MonitoringOfChronicDisease, Long> {
}