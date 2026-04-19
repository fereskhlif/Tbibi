package tn.esprit.pi.tbibi.services.TreatmentPlanService;

import tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan.TreatmentPlanRequest;
import tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan.TreatmentPlanResponse;

import java.util.List;

public interface ITreatmentPlanService {
    TreatmentPlanResponse create(TreatmentPlanRequest request);
    TreatmentPlanResponse getById(Integer id);
    List<TreatmentPlanResponse> getAll();
    List<TreatmentPlanResponse> getByPatient(Integer patientId);
    List<TreatmentPlanResponse> getByPhysiotherapist(Integer physiotherapistId);
    List<TreatmentPlanResponse> getByPhysiotherapistAndStatus(Integer physiotherapistId, String status);
    TreatmentPlanResponse update(Integer id, TreatmentPlanRequest request);
    TreatmentPlanResponse updateStatus(Integer id, String status);
    void delete(Integer id);
}
