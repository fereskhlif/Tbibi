package tn.esprit.pi.tbibi.services.PatientEvaluationService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation.PatientEvaluationRequest;
import tn.esprit.pi.tbibi.DTO.dtoPatientEvaluation.PatientEvaluationResponse;
import tn.esprit.pi.tbibi.entities.PatientEvaluation;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.PatientEvaluationMapper;
import tn.esprit.pi.tbibi.repositories.PatientEvaluationRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientEvaluationService implements IPatientEvaluationService {

    private final PatientEvaluationRepository evaluationRepo;
    private final UserRepo userRepo;
    private final PatientEvaluationMapper mapper;

    @Override
    public PatientEvaluationResponse create(PatientEvaluationRequest request) {
        User patient = userRepo.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + request.getPatientId()));
        User physio = userRepo.findById(request.getPhysiotherapistId())
                .orElseThrow(() -> new RuntimeException("Physiotherapist not found with id: " + request.getPhysiotherapistId()));
        
        PatientEvaluation evaluation = mapper.toEntity(request);
        evaluation.setPatient(patient);
        evaluation.setPhysiotherapist(physio);
        
        return mapper.toResponse(evaluationRepo.save(evaluation));
    }

    @Override
    public PatientEvaluationResponse getById(Integer id) {
        PatientEvaluation evaluation = evaluationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient evaluation not found with id: " + id));
        return mapper.toResponse(evaluation);
    }

    @Override
    public List<PatientEvaluationResponse> getAll() {
        return evaluationRepo.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PatientEvaluationResponse> getByPatient(Integer patientId) {
        return evaluationRepo.findByPatient_UserIdOrderByEvaluationDateDesc(patientId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PatientEvaluationResponse> getByPhysiotherapist(Integer physiotherapistId) {
        return evaluationRepo.findByPhysiotherapist_UserId(physiotherapistId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PatientEvaluationResponse update(Integer id, PatientEvaluationRequest request) {
        PatientEvaluation evaluation = evaluationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient evaluation not found with id: " + id));
        
        if (request.getEvaluationDate() != null) evaluation.setEvaluationDate(request.getEvaluationDate());
        if (request.getPainScale() != null) evaluation.setPainScale(request.getPainScale());
        if (request.getPainDescription() != null) evaluation.setPainDescription(request.getPainDescription());
        if (request.getFlexionDegrees() != null) evaluation.setFlexionDegrees(request.getFlexionDegrees());
        if (request.getExtensionDegrees() != null) evaluation.setExtensionDegrees(request.getExtensionDegrees());
        if (request.getJointLocation() != null) evaluation.setJointLocation(request.getJointLocation());
        if (request.getFunctionalLimitations() != null) evaluation.setFunctionalLimitations(request.getFunctionalLimitations());
        if (request.getGeneralObservations() != null) evaluation.setGeneralObservations(request.getGeneralObservations());
        if (request.getTreatmentGoals() != null) evaluation.setTreatmentGoals(request.getTreatmentGoals());
        
        evaluation.setUpdatedAt(LocalDateTime.now());
        
        return mapper.toResponse(evaluationRepo.save(evaluation));
    }

    @Override
    public void delete(Integer id) {
        evaluationRepo.deleteById(id);
    }
}
