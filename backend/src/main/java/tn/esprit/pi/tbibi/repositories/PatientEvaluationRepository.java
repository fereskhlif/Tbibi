package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.PatientEvaluation;

import java.util.List;

@Repository
public interface PatientEvaluationRepository extends JpaRepository<PatientEvaluation, Integer> {
    List<PatientEvaluation> findByPatient_UserId(Integer patientId);
    List<PatientEvaluation> findByPhysiotherapist_UserId(Integer physiotherapistId);
    List<PatientEvaluation> findByPatient_UserIdOrderByEvaluationDateDesc(Integer patientId);
}
