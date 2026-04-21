package tn.esprit.pi.tbibi.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.PatientReportDTO;
import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;
import tn.esprit.pi.tbibi.DTO.CheckSubstituteRequest;
import tn.esprit.pi.tbibi.DTO.CheckSubstituteResponse;
import tn.esprit.pi.tbibi.DTO.AiPredictRequest;
import tn.esprit.pi.tbibi.DTO.AiPredictResponse;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineResponse;
import tn.esprit.pi.tbibi.entities.PrescriptionStatus;
import tn.esprit.pi.tbibi.services.PrescriptionService;
import tn.esprit.pi.tbibi.services.IMedicineService;
import tn.esprit.pi.tbibi.services.PrescriptionAiService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PrescriptionController {

    private final PrescriptionService service;
    private final IMedicineService medicineService;
    private final PrescriptionAiService prescriptionAiService;

//    @GetMapping("/all")
//    public ResponseEntity<List<PrescriptionResponse>> getAll() {
//        return ResponseEntity.ok(service.getAll());
//    }

    @GetMapping("/get/{id}")
    public ResponseEntity<PrescriptionResponse> getById(@PathVariable int id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/patient/{patientId}/report")
    public ResponseEntity<PatientReportDTO> getPatientReport(@PathVariable Integer patientId) {
        log.info("=== GET PATIENT REPORT ID: {} ===", patientId);
        try {
            return ResponseEntity.ok(service.getPatientReport(patientId));
        } catch (RuntimeException e) {
            log.error("Report generation failed for patientId {}: {}", patientId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<PrescriptionResponse> add(@RequestBody PrescriptionRequest request) {
        log.info("=== ADD PRESCRIPTION ===");
        log.info("Request reçue: {}", request);
        log.info("Note: {}", request.getNote());
        log.info("Date: {}", request.getDate());
        log.info("Date type: {}", request.getDate() != null ? request.getDate().getClass().getName() : "null");

        try {
            PrescriptionResponse response = service.add(request);
            log.info("Prescription ajoutée avec ID: {}", response.getPrescriptionID());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de l'ajout: {}", e.getMessage(), e);
            throw e;
        }
    }
    @GetMapping("/all")
    public ResponseEntity<String> getAll() throws Exception {
        List<PrescriptionResponse> list = service.getAll();
        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(list);
        System.out.println("JSON LENGTH: " + json.length());
        System.out.println("JSON: " + json);
        return ResponseEntity.ok(json);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<PrescriptionResponse> update(
            @PathVariable int id,
            @RequestBody PrescriptionRequest request) {
        try {
            return ResponseEntity.ok(service.update(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PrescriptionResponse> updateStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {
        try {
            PrescriptionStatus status = PrescriptionStatus.valueOf(body.get("status"));
            return ResponseEntity.ok(service.updateStatus(id, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }



    @PatchMapping("/{id}/assign-acte")
    public ResponseEntity<PrescriptionResponse> assignActe(
            @PathVariable int id,
            @RequestBody Map<String, Integer> body) {
        try {
            return ResponseEntity.ok(service.assignActe(id, body.get("acteId")));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Returns only the prescriptions of the currently authenticated patient,
     * enriched with doctor information. Used by the patient portal.
     */
    @GetMapping("/my")
    public ResponseEntity<List<PrescriptionResponse>> getMyPrescriptions() {
        return ResponseEntity.ok(service.getMyPrescriptions());
    }

    /**
     * Returns prescriptions whose linked Acte has a typeOfActe related to analysis.
     * Used by the laboratory portal.
     */
    @GetMapping("/analysis")
    public ResponseEntity<List<PrescriptionResponse>> getAnalysisPrescriptions() {
        return ResponseEntity.ok(service.getAnalysisPrescriptions());
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<PrescriptionResponse> renewPrescription(@PathVariable int id) {
        try {
            return ResponseEntity.ok(service.renewPrescription(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/check-substitutes")
    public ResponseEntity<CheckSubstituteResponse> checkSubstitutes(@RequestBody CheckSubstituteRequest req) {
        try {
            boolean isAvailable = false;
            
            boolean hasMedicineName = req.getMedicineName() != null && !req.getMedicineName().trim().isEmpty();
            
            if (req.getMedicineId() != null) {
                try {
                    MedicineResponse med = medicineService.getMedicineById(req.getMedicineId());
                    isAvailable = med.isAvailable() && med.getStock() > 0;
                } catch (Exception e) {
                    log.warn("Medicine ID {} not found", req.getMedicineId());
                }
            } else if (hasMedicineName) {
                // simple search by name
                List<MedicineResponse> meds = medicineService.searchByName(req.getMedicineName());
                if (!meds.isEmpty()) {
                    isAvailable = meds.get(0).isAvailable() && meds.get(0).getStock() > 0;
                }
            }
            
            CheckSubstituteResponse response = new CheckSubstituteResponse();
            response.setAvailable(isAvailable);
            
            if (!isAvailable) {
                if (!hasMedicineName) {
                    response.setStatusMessage("Recherche basée sur l'indication via l'IA...");
                } else {
                    response.setStatusMessage("Médicament indisponible. Recherche d'alternatives via l'IA...");
                }
                response.setAiAlternatives(prescriptionAiService.getAlternatives(
                        req.getMedicineName(),
                        req.getIndication(),
                        req.getFamille(),
                        req.getPatientId()
                ));
            } else {
                response.setStatusMessage("Médicament disponible en stock.");
            }
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Erreur lors de la vérification de disponibilité: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/ai-predict")
    public ResponseEntity<AiPredictResponse> predictAiRecommandation(@RequestBody AiPredictRequest req) {
        try {
            if (req.getPatientId() == null || req.getIndication() == null || req.getIndication().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(AiPredictResponse.builder().error("L'ID patient et le symptôme sont obligatoires.").build());
            }
            AiPredictResponse response = prescriptionAiService.predictTherapeuticClass(req);
            if (response.getError() != null) {
                return ResponseEntity.internalServerError().body(response);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la prédiction IA: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}