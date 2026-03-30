package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.HealthGoal;

import java.util.List;

public interface HealthGoalRepo extends JpaRepository<HealthGoal, Long> {

    List<HealthGoal> findByUserUserId(Long userId);
}