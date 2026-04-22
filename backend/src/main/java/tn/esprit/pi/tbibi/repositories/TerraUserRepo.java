package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.TerraUser;

import java.util.Optional;

public interface TerraUserRepo extends JpaRepository<TerraUser, Long> {
    Optional<TerraUser> findByPatientId(Integer patientId);
    Optional<TerraUser> findByTerraUserId(String terraUserId);
    boolean existsByPatientId(Integer patientId);
}
