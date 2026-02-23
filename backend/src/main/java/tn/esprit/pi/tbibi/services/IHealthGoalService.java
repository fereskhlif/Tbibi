package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.*;
import java.util.List;

public interface IHealthGoalService {

    List<HealthGoalResponse> getAll();

    HealthGoalResponse add(HealthGoalRequest request);

    HealthGoalResponse update(Long id, HealthGoalRequest request);

    void delete(Long id);
}