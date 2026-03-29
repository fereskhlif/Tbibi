package tn.esprit.pi.tbibi.mappers;

import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan.TreatmentPlanRequest;
import tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan.TreatmentPlanResponse;
import tn.esprit.pi.tbibi.entities.TreatmentPlan;

import java.time.LocalDate;

@Component
public class TreatmentPlanMapper {
    
    public TreatmentPlan toEntity(TreatmentPlanRequest request) {
        if (request == null) return null;
        
        return TreatmentPlan.builder()
                .planName(request.getPlanName())
                .diagnosis(request.getDiagnosis())
                .therapeuticGoals(request.getTherapeuticGoals())
                .exercises(request.getExercises())
                .durationWeeks(request.getDurationWeeks())
                .startDate(request.getStartDate())
                .status(request.getStatus() != null ? request.getStatus() : "Active")
                .notes(request.getNotes())
                .createdAt(LocalDate.now())
                .updatedAt(LocalDate.now())
                .build();
    }
    
    public TreatmentPlanResponse toResponse(TreatmentPlan plan) {
        if (plan == null) return null;
        
        return TreatmentPlanResponse.builder()
                .planId(plan.getPlanId())
                .patientId(plan.getPatient() != null ? plan.getPatient().getUserId() : null)
                .patientName(plan.getPatient() != null ? plan.getPatient().getName() : null)
                .patientEmail(plan.getPatient() != null ? plan.getPatient().getEmail() : null)
                .physiotherapistId(plan.getPhysiotherapist() != null ? plan.getPhysiotherapist().getUserId() : null)
                .physiotherapistName(plan.getPhysiotherapist() != null ? plan.getPhysiotherapist().getName() : null)
                .planName(plan.getPlanName())
                .diagnosis(plan.getDiagnosis())
                .therapeuticGoals(plan.getTherapeuticGoals())
                .exercises(plan.getExercises())
                .durationWeeks(plan.getDurationWeeks())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .status(plan.getStatus())
                .notes(plan.getNotes())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}
