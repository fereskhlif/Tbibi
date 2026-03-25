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
            "WHERE mr.medicalfile_id = :id",
            nativeQuery = true)
    Optional<User> findUserByMedicalFileId(@Param("id") int medicalFileId);

    @Query(value = "SELECT u.* FROM users u " +
            "INNER JOIN role r ON u.role_id = r.role_id " +
            "WHERE r.role_name = :roleName",
            nativeQuery = true)
    List<User> findAllByRoleName(@Param("roleName") String roleName);

    @Query(value = "SELECT u.* FROM users u " +
            "INNER JOIN role r ON u.role_id = r.role_id " +
            "WHERE r.role_name = 'PATIENT' " +
            "AND LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))",
            nativeQuery = true)
    List<User> searchPatientsByName(@Param("name") String name);
}