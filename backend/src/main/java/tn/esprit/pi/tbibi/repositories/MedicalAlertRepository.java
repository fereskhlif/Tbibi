package tn.esprit.pi.tbibi.repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.MedicalAlert;

public interface MedicalAlertRepository extends JpaRepository<MedicalAlert, Long> {

}

