package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    // ✅ Simplifié — plus de référence à laboratory_group
    @Query("SELECT u FROM User u WHERE u.role IS NOT NULL")
    List<User> findAllLaboratoryUsers(@Param("labGroup") String labGroup);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END " +
           "FROM User u WHERE u.userId = :userId " +
           "AND u.role IS NOT NULL")
    boolean isLaboratoryUser(@Param("userId") Integer userId);
}