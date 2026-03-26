package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.pi.tbibi.entities.User;
import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

        Optional<User> findByEmail(String email);

        @Query(value = "SELECT u.* FROM users u " +
                        "INNER JOIN medical_reccords mr ON mr.patient_id = u.user_id " +
                        "WHERE mr.medicalfile_id = :id", nativeQuery = true)
        Optional<User> findUserByMedicalFileId(@Param("id") int medicalFileId);

        @Query(value = "SELECT u.* FROM users u " +
                        "INNER JOIN role r ON u.role_id = r.role_id " +
                        "WHERE r.role_name = :roleName", nativeQuery = true)
        List<User> findAllByRoleName(@Param("roleName") String roleName);

        @Query(value = "SELECT u.* FROM users u " +
                        "INNER JOIN role r ON u.role_id = r.role_id " +
                        "WHERE r.role_name = 'PATIENT' " +
                        "AND LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))", nativeQuery = true)
        List<User> searchPatientsByName(@Param("name") String name);

        Optional<User> findByEmail(String email);

        // Returns all users whose role name contains "DOCTOR" (case-insensitive)
        @Query("SELECT u FROM User u WHERE LOWER(u.role.roleName) LIKE 'doct%'")
        List<User> findAllDoctors();

        // Returns doctors filtered by specialty (case-insensitive)
        @Query("SELECT u FROM User u WHERE LOWER(u.role.roleName) LIKE 'doct%' AND LOWER(u.specialty) = LOWER(:specialty)")
        List<User> findDoctorsBySpecialty(@Param("specialty") String specialty);

        // Returns distinct non-null specialties for all doctors
        @Query("SELECT DISTINCT u.specialty FROM User u WHERE LOWER(u.role.roleName) LIKE 'doct%' AND u.specialty IS NOT NULL AND u.specialty <> ''")
        List<String> findDistinctSpecialties();

        @Query("SELECT concat('ID:', u.userId, ' | Name:', u.name, ' | Specialty:', u.specialty, ' | Role:', u.role.roleName) FROM User u")
        List<String> findDebugInfo();

        /**
         * Returns doctors whose name contains the given string (case-insensitive).
         * Pattern should be %name%
         */
        @Query("SELECT u FROM User u JOIN u.role r WHERE LOWER(r.roleName) LIKE 'doct%' AND LOWER(u.name) LIKE LOWER(:pattern)")
        List<User> findDoctorsByNameContaining(@Param("pattern") String pattern);
}
