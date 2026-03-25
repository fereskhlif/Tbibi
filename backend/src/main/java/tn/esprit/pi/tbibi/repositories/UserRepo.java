package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.pi.tbibi.entities.User;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Integer> {

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

    /** Returns doctors whose name contains the given string (case-insensitive). Pattern should be %name% */
    @Query("SELECT u FROM User u JOIN u.role r WHERE LOWER(r.roleName) LIKE 'doct%' AND LOWER(u.name) LIKE LOWER(:pattern)")
    List<User> findDoctorsByNameContaining(@Param("pattern") String pattern);
}
