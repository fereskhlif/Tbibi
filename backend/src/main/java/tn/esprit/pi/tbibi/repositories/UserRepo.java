package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.pi.tbibi.entities.User;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query(value = "SELECT u.* FROM users u " +
            "INNER JOIN medical_reccords mr ON mr.patient_id = u.user_id " +
            "WHERE mr.medicalfile_id = :id",
            nativeQuery = true)
    Optional<User> findUserByMedicalFileId(@Param("id") int medicalFileId);
}