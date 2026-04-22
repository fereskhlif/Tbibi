package tn.esprit.pi.tbibi.services.TreatmentPlanService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan.TreatmentPlanRequest;
import tn.esprit.pi.tbibi.DTO.dtoTreatmentPlan.TreatmentPlanResponse;
import tn.esprit.pi.tbibi.entities.TreatmentPlan;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.TreatmentPlanMapper;
import tn.esprit.pi.tbibi.repositories.TreatmentPlanRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TreatmentPlanService implements ITreatmentPlanService {

    private final TreatmentPlanRepository planRepo;
    private final UserRepo userRepo;
    private final TreatmentPlanMapper mapper;

    @Override
    public TreatmentPlanResponse create(TreatmentPlanRequest request) {
        User patient = userRepo.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + request.getPatientId()));
        User physio = userRepo.findById(request.getPhysiotherapistId())
                .orElseThrow(() -> new RuntimeException("Physiotherapist not found with id: " + request.getPhysiotherapistId()));
        
        TreatmentPlan plan = mapper.toEntity(request);
        plan.setPatient(patient);
        plan.setPhysiotherapist(physio);
        
        // Calculate end date based on duration
        if (request.getStartDate() != null && request.getDurationWeeks() != null) {
            plan.setEndDate(request.getStartDate().plusWeeks(request.getDurationWeeks()));
        }
        
        return mapper.toResponse(planRepo.save(plan));
    }

    @Override
    public TreatmentPlanResponse getById(Integer id) {
        TreatmentPlan plan = planRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment plan not found with id: " + id));
        return mapper.toResponse(plan);
    }

    @Override
    public List<TreatmentPlanResponse> getAll() {
        return planRepo.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TreatmentPlanResponse> getByPatient(Integer patientId) {
        return planRepo.findByPatient_UserId(patientId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TreatmentPlanResponse> getByPhysiotherapist(Integer physiotherapistId) {
        return planRepo.findByPhysiotherapist_UserId(physiotherapistId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TreatmentPlanResponse> getByPhysiotherapistAndStatus(Integer physiotherapistId, String status) {
        return planRepo.findByPhysiotherapist_UserIdAndStatus(physiotherapistId, status)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TreatmentPlanResponse update(Integer id, TreatmentPlanRequest request) {
        TreatmentPlan plan = planRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment plan not found with id: " + id));
        
        if (request.getPlanName() != null) plan.setPlanName(request.getPlanName());
        if (request.getDiagnosis() != null) plan.setDiagnosis(request.getDiagnosis());
        if (request.getTherapeuticGoals() != null) plan.setTherapeuticGoals(request.getTherapeuticGoals());
        if (request.getExercises() != null) plan.setExercises(request.getExercises());
        if (request.getDurationWeeks() != null) {
            plan.setDurationWeeks(request.getDurationWeeks());
            if (plan.getStartDate() != null) {
                plan.setEndDate(plan.getStartDate().plusWeeks(request.getDurationWeeks()));
            }
        }
        if (request.getStartDate() != null) {
            plan.setStartDate(request.getStartDate());
            if (plan.getDurationWeeks() != null) {
                plan.setEndDate(request.getStartDate().plusWeeks(plan.getDurationWeeks()));
            }
        }
        if (request.getStatus() != null) plan.setStatus(request.getStatus());
        if (request.getNotes() != null) plan.setNotes(request.getNotes());
        
        plan.setUpdatedAt(LocalDate.now());
        
        return mapper.toResponse(planRepo.save(plan));
    }

    @Override
    public TreatmentPlanResponse updateStatus(Integer id, String status) {
        TreatmentPlan plan = planRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment plan not found with id: " + id));
        plan.setStatus(status);
        plan.setUpdatedAt(LocalDate.now());
        return mapper.toResponse(planRepo.save(plan));
    }

    @Override
    public void delete(Integer id) {
        planRepo.deleteById(id);
    }
}
