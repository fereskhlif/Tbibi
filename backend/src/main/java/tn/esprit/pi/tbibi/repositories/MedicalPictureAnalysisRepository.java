package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.MedicalPictureAnalysis;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalPictureAnalysisRepository extends JpaRepository<MedicalPictureAnalysis, Integer> {

    Optional<MedicalPictureAnalysis> findByLaboratoryResult_LabId(Integer labId);

    // ✅ Ces 2 méthodes manquaient
    List<MedicalPictureAnalysis> findByStatus(String status);
    List<MedicalPictureAnalysis> findByCategory(String category);
}