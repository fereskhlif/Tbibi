package tn.esprit.pi.tbibi.mappers;

import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation.PatientEvaluationRequest;
import tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation.PatientEvaluationResponse;
import tn.esprit.pi.tbibi.entities.PatientEvaluation;

import java.time.LocalDateTime;

@Component
public class PatientEvaluationMapper {
    
    public PatientEvaluation toEntity(PatientEvaluationRequest request) {
        if (request == null) return null;
        
        return PatientEvaluation.builder()
                .evaluationDate(request.getEvaluationDate())
                .painScale(request.getPainScale())
                .painDescription(request.getPainDescription())
                .flexionDegrees(request.getFlexionDegrees())
                .extensionDegrees(request.getExtensionDegrees())
                .jointLocation(request.getJointLocation())
                .functionalLimitations(request.getFunctionalLimitations())
                .generalObservations(request.getGeneralObservations())
                .treatmentGoals(request.getTreatmentGoals())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
    
    public PatientEvaluationResponse toResponse(PatientEvaluation evaluation) {
        if (evaluation == null) return null;
        
        return PatientEvaluationResponse.builder()
                .evaluationId(evaluation.getEvaluationId())
                .patientId(evaluation.getPatient() != null ? evaluation.getPatient().getUserId() : null)
                .patientName(evaluation.getPatient() != null ? evaluation.getPatient().getName() : null)
                .patientEmail(evaluation.getPatient() != null ? evaluation.getPatient().getEmail() : null)
                .physiotherapistId(evaluation.getPhysiotherapist() != null ? evaluation.getPhysiotherapist().getUserId() : null)
                .physiotherapistName(evaluation.getPhysiotherapist() != null ? evaluation.getPhysiotherapist().getName() : null)
                .evaluationDate(evaluation.getEvaluationDate())
                .painScale(evaluation.getPainScale())
                .painDescription(evaluation.getPainDescription())
                .flexionDegrees(evaluation.getFlexionDegrees())
                .extensionDegrees(evaluation.getExtensionDegrees())
                .jointLocation(evaluation.getJointLocation())
                .functionalLimitations(evaluation.getFunctionalLimitations())
                .generalObservations(evaluation.getGeneralObservations())
                .treatmentGoals(evaluation.getTreatmentGoals())
                .createdAt(evaluation.getCreatedAt())
                .updatedAt(evaluation.getUpdatedAt())
                .build();
    }
}
