package tn.esprit.pi.tbibi.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import tn.esprit.pi.tbibi.entities.PasswordResetToken;
import tn.esprit.pi.tbibi.entities.User;

import java.util.Optional;

public interface PasswordRestTokenRepository extends JpaRepository<PasswordResetToken,Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);

    @Modifying
    @Transactional
    void deleteByUser(User user);
}
