package tn.esprit.pi.tbibi.services.Laboratory_ResultService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultRequest;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultResponse;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.Laboratory_ResultMapper;
import tn.esprit.pi.tbibi.repositories.Laboratory_ResultRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class Laboratory_ResultService implements ILaboratory_ResultService {

    private final Laboratory_ResultRepository labRepo;
    private final UserRepo userRepo;
    private final Laboratory_ResultMapper mapper;

    @Override
    public Laboratory_ResultResponse create(Laboratory_ResultRequest request) {
        // ✅ Validate required field
        if (request.getLaboratoryUserId() == null) {
            throw new RuntimeException("laboratoryUserId is required but was null");
        }
        
        System.out.println("🔍 Looking for laboratory user with ID: " + request.getLaboratoryUserId());
        User labUser = userRepo.findById((long) request.getLaboratoryUserId())
                .orElseThrow(() -> new RuntimeException("Laboratory user not found with id: " + request.getLaboratoryUserId()));
        
        System.out.println("✅ Found laboratory user: " + labUser.getName());
        Laboratory_Result lab = mapper.toEntity(request);
        lab.setLaboratoryUser(labUser);

        // Lier le patient si fourni
        if (request.getPatientId() != null && request.getPatientId() > 0) {
            User patient = userRepo.findById((long) request.getPatientId())
                    .orElse(null);  // ✅ Don't throw error, just set to null if not found
            if (patient != null) {
                lab.setPatient(patient);
            } else {
                System.out.println("⚠️ Warning: Patient ID " + request.getPatientId() + " not found, proceeding without patient");
            }
        }

        // ✅ Lier le médecin prescripteur si fourni
        if (request.getPrescribedByDoctorId() != null && request.getPrescribedByDoctorId() > 0) {
            User doctor = userRepo.findById((long) request.getPrescribedByDoctorId())
                    .orElse(null);  // ✅ Don't throw error, just set to null if not found
            if (doctor != null) {
                lab.setPrescribedByDoctor(doctor);
            } else {
                System.out.println("⚠️ Warning: Doctor ID " + request.getPrescribedByDoctorId() + " not found, proceeding without prescribing doctor");
            }
        }

        if (lab.getStatus() == null || lab.getStatus().isEmpty()) {
            lab.setStatus("Pending");
        }
        
        // ✅ Définir la priorité par défaut si non fournie
        if (request.getPriority() == null || request.getPriority().isEmpty()) {
            lab.setPriority("Normal");
        }
        
        // ✅ Définir la date de demande si non fournie
        if (request.getRequestedAt() == null) {
            lab.setRequestedAt(LocalDateTime.now());
        }

        lab.setNotificationMessage(
                "📋 New laboratory results available — Test: '" + request.getTestName() +
                        "' | Lab: " + request.getNameLabo() +
                        " | Status: " + lab.getStatus()
        );
        lab.setNotificationSent(true);
        lab.setNotificationDate(LocalDate.now());

        // ✅ NOUVEAU — Scheduled
        lab.setCreatedAt(LocalDateTime.now());
        lab.setScheduledNotifSent(false);

        return mapper.toResponse(labRepo.save(lab));
    }

    @Override
    public Laboratory_ResultResponse getById(Integer id) {
        Laboratory_Result lab = labRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Laboratory result not found with id: " + id));
        return mapper.toResponse(ensureDefaults(lab));
    }

    @Override
    public List<Laboratory_ResultResponse> getAll() {
        try {
            return labRepo.findAll()
                    .stream()
                    .map(this::ensureDefaults)
                    .map(lab -> {
                        try {
                            return mapper.toResponse(lab);
                        } catch (Exception e) {
                            // Log l'erreur et retourne null pour filtrer après
                            System.err.println("Error mapping lab result " + lab.getLabId() + ": " + e.getMessage());
                            return null;
                        }
                    })
                    .filter(response -> response != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getAll: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error retrieving laboratory results: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Laboratory_ResultResponse> getByLaboratoryUser(Integer userId) {
        return labRepo.findByLaboratoryUser_UserId(userId)
                .stream()
                .map(this::ensureDefaults)
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Laboratory_ResultResponse> getByPatient(Integer patientId) {
        return labRepo.findByPatient_UserId(patientId)
                .stream()
                .map(this::ensureDefaults)
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Laboratory_ResultResponse> getByPrescribedByDoctor(Integer doctorId) {
        return labRepo.findByPrescribedByDoctor_UserId(doctorId)
                .stream()
                .map(this::ensureDefaults)
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Laboratory_ResultResponse> getByStatus(String status) {
        return labRepo.findByStatus(status)
                .stream()
                .map(this::ensureDefaults)
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Laboratory_ResultResponse update(Integer id, Laboratory_ResultRequest request) {
        Laboratory_Result lab = labRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Laboratory result not found with id: " + id));
        lab.setTestName(request.getTestName());
        lab.setLocation(request.getLocation());
        lab.setNameLabo(request.getNameLabo());
        lab.setResultValue(request.getResultValue());
        lab.setStatus(request.getStatus());
        lab.setTestDate(request.getTestDate());

        if (request.getPatientId() != null && request.getPatientId() > 0) {
            User patient = userRepo.findById((long) request.getPatientId())
                    .orElse(null);
            if (patient != null) {
                lab.setPatient(patient);
            } else {
                System.out.println("⚠️ Warning: Patient ID " + request.getPatientId() + " not found during update");
            }
        }

        // ✅ Mettre à jour le médecin prescripteur si fourni
        if (request.getPrescribedByDoctorId() != null && request.getPrescribedByDoctorId() > 0) {
            User doctor = userRepo.findById((long) request.getPrescribedByDoctorId())
                    .orElse(null);
            if (doctor != null) {
                lab.setPrescribedByDoctor(doctor);
            } else {
                System.out.println("⚠️ Warning: Doctor ID " + request.getPrescribedByDoctorId() + " not found during update");
            }
        }

        lab.setNotificationMessage(
                "📋 Laboratory results updated — Test: '" + request.getTestName() +
                        "' | New Status: " + request.getStatus()
        );
        lab.setNotificationDate(LocalDate.now());

        // ✅ Reset scheduled si update (mais garder createdAt original)
        lab.setScheduledNotifSent(false);

        return mapper.toResponse(labRepo.save(lab));
    }

    @Override
    public Laboratory_ResultResponse updateStatus(Integer id, String newStatus) {
        Laboratory_Result lab = labRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Laboratory result not found with id: " + id));
        
        String oldStatus = lab.getStatus();
        lab.setStatus(newStatus);
        lab.setNotificationMessage(
                "🔄 Status updated to '" + newStatus + "' — Test: " + lab.getTestName()
        );
        lab.setNotificationDate(LocalDate.now());
        lab.setNotificationSent(true);

        // ✅ Reset scheduled si statut change (mais garder createdAt original)
        lab.setScheduledNotifSent(false);

        Laboratory_Result saved = labRepo.save(lab);
        
        // ✅ Send notifications to relevant users
        System.out.println("📢 Status changed from '" + oldStatus + "' to '" + newStatus + "' for test: " + lab.getTestName());
        
        // Notify patient if assigned
        if (saved.getPatient() != null) {
            System.out.println("   → Notifying patient: " + saved.getPatient().getName());
        }
        
        // Notify prescribing doctor if assigned
        if (saved.getPrescribedByDoctor() != null) {
            System.out.println("   → Notifying doctor: " + saved.getPrescribedByDoctor().getName());
        }

        return mapper.toResponse(saved);
    }

    @Override
    public void delete(Integer id) {
        labRepo.deleteById(id);
    }

    @Override
    public List<Laboratory_ResultResponse> getByPriority(String priority) {
        return labRepo.findByPriority(priority)
                .stream()
                .map(this::ensureDefaults)
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Laboratory_ResultResponse> getPendingRequests() {
        return labRepo.findByStatus("Pending")
                .stream()
                .map(this::ensureDefaults)
                .map(mapper::toResponse)
                .sorted((a, b) -> {
                    // Trier par priorité (Critical > Urgent > Normal) puis par date
                    int priorityCompare = getPriorityOrder(b.getPriority()) - getPriorityOrder(a.getPriority());
                    if (priorityCompare != 0) return priorityCompare;
                    
                    // Gérer les cas où requestedAt est null
                    if (a.getRequestedAt() == null && b.getRequestedAt() == null) return 0;
                    if (a.getRequestedAt() == null) return 1;
                    if (b.getRequestedAt() == null) return -1;
                    
                    return b.getRequestedAt().compareTo(a.getRequestedAt());
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Laboratory_ResultResponse> getUrgentRequests() {
        return labRepo.findAll()
                .stream()
                .map(this::ensureDefaults)
                .filter(lab -> {
                    String priority = lab.getPriority();
                    return priority != null && 
                           ("Urgent".equalsIgnoreCase(priority) || "Critical".equalsIgnoreCase(priority));
                })
                .map(mapper::toResponse)
                .sorted((a, b) -> {
                    // Gérer les cas où requestedAt est null
                    if (a.getRequestedAt() == null && b.getRequestedAt() == null) return 0;
                    if (a.getRequestedAt() == null) return 1;
                    if (b.getRequestedAt() == null) return -1;
                    
                    return b.getRequestedAt().compareTo(a.getRequestedAt());
                })
                .collect(Collectors.toList());
    }

    private int getPriorityOrder(String priority) {
        if (priority == null) return 0;
        switch (priority.toLowerCase()) {
            case "critical": return 3;
            case "urgent": return 2;
            case "normal": return 1;
            default: return 0;
        }
    }

    // ✅ Méthode helper pour assurer que les valeurs par défaut sont présentes
    private Laboratory_Result ensureDefaults(Laboratory_Result lab) {
        try {
            if (lab == null) {
                return null;
            }
            
            if (lab.getPriority() == null || lab.getPriority().trim().isEmpty()) {
                lab.setPriority("Normal");
            }
            
            if (lab.getRequestedAt() == null) {
                if (lab.getCreatedAt() != null) {
                    lab.setRequestedAt(lab.getCreatedAt());
                } else if (lab.getTestDate() != null) {
                    lab.setRequestedAt(lab.getTestDate().atStartOfDay());
                } else {
                    lab.setRequestedAt(LocalDateTime.now());
                }
            }
            
            // NE PAS sauvegarder ici - juste retourner l'entité modifiée
            return lab;
        } catch (Exception e) {
            System.err.println("Error in ensureDefaults for lab " + (lab != null ? lab.getLabId() : "null") + ": " + e.getMessage());
            // En cas d'erreur, retourner l'entité telle quelle
            return lab;
        }
    }

    @Override
    public byte[] generateReport(Integer id) {
        throw new UnsupportedOperationException("PDF report generation will be implemented in next sprint");
    }
}