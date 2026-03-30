package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;

import java.time.LocalDateTime;
import java.util.List;

public interface Laboratory_ResultRepository extends JpaRepository<Laboratory_Result, Integer> {

    List<Laboratory_Result> findByLaboratoryUser_UserId(Integer userId);

    List<Laboratory_Result> findByStatus(String status);

    List<Laboratory_Result> findByPatient_UserId(Integer patientId);

    // ✅ Résultats prescrits par un médecin
    List<Laboratory_Result> findByPrescribedByDoctor_UserId(Integer doctorId);
    
    // ✅ Filtrage par priorité
    List<Laboratory_Result> findByPriority(String priority);

    // ✅ NOUVEAU — pour le Scheduled
    // Cherche les résultats dont la notif n'a pas été envoyée ET créés avant X minutes
    List<Laboratory_Result> findByScheduledNotifSentFalseAndCreatedAtBefore(LocalDateTime dateTime);
}