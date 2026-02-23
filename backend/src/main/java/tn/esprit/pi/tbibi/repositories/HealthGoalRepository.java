package tn.esprit.pi.tbibi.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.HealthGoal;

public interface HealthGoalRepository
        extends JpaRepository<HealthGoal, Long> {
}