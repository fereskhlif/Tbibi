package tn.esprit.pi.tbibi.services.PatientEvaluationService;

import tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation.PatientEvaluationRequest;
import tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation.PatientEvaluationResponse;

import java.util.List;

public interface IPatientEvaluationService {
    PatientEvaluationResponse create(PatientEvaluationRequest request);
    PatientEvaluationResponse getById(Integer id);
    List<PatientEvaluationResponse> getAll();
    List<PatientEvaluationResponse> getByPatient(Integer patientId);
    List<PatientEvaluationResponse> getByPhysiotherapist(Integer physiotherapistId);
    PatientEvaluationResponse update(Integer id, PatientEvaluationRequest request);
    void delete(Integer id);
}
