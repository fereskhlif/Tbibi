package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.TreatmentPlan;

import java.util.List;

@Repository
public interface TreatmentPlanRepository extends JpaRepository<TreatmentPlan, Integer> {
    List<TreatmentPlan> findByPatient_UserId(Integer patientId);
    List<TreatmentPlan> findByPhysiotherapist_UserId(Integer physiotherapistId);
    List<TreatmentPlan> findByPhysiotherapist_UserIdAndStatus(Integer physiotherapistId, String status);
}
