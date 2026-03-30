package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.entities.HealthGoal;
import tn.esprit.pi.tbibi.services.IHealthGoalService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest
class HealthGoalServiceTest {

    @Autowired
    private IHealthGoalService healthGoalService;

    @Test
    void testCreateHealthGoal() {

        HealthGoal goal = new HealthGoal();
        goal.setGoalTitle("Test goal");
        goal.setGoalDescription("Test description");

        // ✅ FIX
        goal.setAchieved(false);

        HealthGoal saved = healthGoalService.createHealthGoal(goal);

        assertNotNull(saved);
        assertNotNull(saved.getId());
    }
}