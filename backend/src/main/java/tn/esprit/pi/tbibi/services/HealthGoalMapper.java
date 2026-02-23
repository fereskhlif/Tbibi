package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.*;
import tn.esprit.pi.tbibi.entities.HealthGoal;

public interface HealthGoalMapper {

    HealthGoal toEntity(HealthGoalRequest request);

    HealthGoalResponse toResponse(HealthGoal entity);
}