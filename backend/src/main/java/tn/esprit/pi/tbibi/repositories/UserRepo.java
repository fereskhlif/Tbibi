package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.User;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
Optional<User> findByEmail(String email);
}
