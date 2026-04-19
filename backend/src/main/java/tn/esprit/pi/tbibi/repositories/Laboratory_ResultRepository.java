package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    // ✅ KEYWORD METHOD 1 - Pour le scheduler - résultats par statut et priorité avant une date
    @Query("SELECT lr FROM Laboratory_Result lr WHERE lr.status = :status " +
           "AND lr.priority IN :priorities AND lr.createdAt < :dateTime")
    List<Laboratory_Result> findByStatusAndPriorityAndCreatedAtBefore(
        @Param("status") String status,
        @Param("priorities") List<String> priorities,
        @Param("dateTime") LocalDateTime dateTime
    );
    
    // ✅ KEYWORD METHOD 2 - Pour le scheduler - résultats par statut avant une date
    List<Laboratory_Result> findByStatusAndCreatedAtBefore(String status, LocalDateTime dateTime);
    
    // ✅ JPQL COMPLEXE 1 - Statistiques des résultats par patient avec JOIN et GROUP BY
    @Query("SELECT lr.patient.userId as patientId, " +
           "lr.patient.name as patientName, " +
           "lr.patient.email as patientEmail, " +
           "COUNT(lr) as totalTests, " +
           "SUM(CASE WHEN lr.status = 'Completed' THEN 1 ELSE 0 END) as completedTests, " +
           "SUM(CASE WHEN lr.status = 'Pending' THEN 1 ELSE 0 END) as pendingTests, " +
           "SUM(CASE WHEN lr.priority = 'Urgent' OR lr.priority = 'Critical' THEN 1 ELSE 0 END) as urgentTests " +
           "FROM Laboratory_Result lr " +
           "JOIN lr.patient p " +
           "WHERE lr.laboratoryUser.userId = :labUserId " +
           "GROUP BY lr.patient.userId, lr.patient.name, lr.patient.email " +
           "ORDER BY totalTests DESC")
    List<Object[]> getPatientStatisticsByLaboratory(@Param("labUserId") Integer labUserId);
    
    // ✅ JPQL COMPLEXE 2 - Résultats avec détails complets (patient + médecin + labo) avec LEFT JOIN FETCH
    @Query("SELECT lr FROM Laboratory_Result lr " +
           "LEFT JOIN FETCH lr.patient p " +
           "LEFT JOIN FETCH lr.prescribedByDoctor d " +
           "LEFT JOIN FETCH lr.laboratoryUser l " +
           "WHERE lr.status = :status " +
           "AND lr.testDate BETWEEN :startDate AND :endDate " +
           "ORDER BY lr.testDate DESC")
    List<Laboratory_Result> findDetailedResultsByStatusAndDateRange(
        @Param("status") String status,
        @Param("startDate") java.time.LocalDate startDate,
        @Param("endDate") java.time.LocalDate endDate
    );
}