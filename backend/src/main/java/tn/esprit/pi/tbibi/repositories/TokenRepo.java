package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Token;

import java.util.Optional;

public interface TokenRepo extends JpaRepository<Token,Integer> {

    Optional<Token> findByToken(String token);
}
