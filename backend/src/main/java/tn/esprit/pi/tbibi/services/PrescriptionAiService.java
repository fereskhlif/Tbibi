package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import tn.esprit.pi.tbibi.DTO.AiAlternativeRequest;
import tn.esprit.pi.tbibi.DTO.AiAlternativeResponse;
import tn.esprit.pi.tbibi.entities.MedicalReccords;
import tn.esprit.pi.tbibi.entities.Medicine;
import tn.esprit.pi.tbibi.entities.Prescription;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.PrescriptionRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.Period;
import tn.esprit.pi.tbibi.DTO.AiPredictRequest;
import tn.esprit.pi.tbibi.DTO.AiPredictResponse;

@Slf4j
@RequiredArgsConstructor
@Service
public class PrescriptionAiService {

    private final UserRepo userRepo;
    private final PrescriptionRepo prescriptionRepo;

    @Value("${ai.prescription.service.url:http://localhost:5001}")
    private String aiServiceUrl;

    public AiAlternativeResponse getAlternatives(String medicament, String indication, String famille, Integer patientId) {
        log.info("Fetching AI alternatives for: {}, indication: {}, famille: {}, patientId: {}", medicament, indication, famille, patientId);

        AiAlternativeRequest.AiPatient aiPatient = new AiAlternativeRequest.AiPatient();
        aiPatient.setNom("Unknown Patient");
        aiPatient.setAllergies(new ArrayList<>());

        if (patientId != null) {
            User patient = userRepo.findById(patientId).orElse(null);
            if (patient != null) {
                aiPatient.setNom(patient.getName());
                if (patient.getMedicalFiles() != null) {
                    List<String> allAllergies = new ArrayList<>();
                    for (MedicalReccords rec : patient.getMedicalFiles()) {
                        if (rec.getAllergies() != null) {
                            allAllergies.addAll(rec.getAllergies());
                        }
                    }
                    aiPatient.setAllergies(allAllergies);
                }
            }
        }

        AiAlternativeRequest requestPayload = AiAlternativeRequest.builder()
                .medicament(medicament)
                .indication(indication == null ? "" : indication)
                .famille(famille == null ? "" : famille)
                .patient(aiPatient)
                .build();

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<AiAlternativeRequest> requestEntity = new HttpEntity<>(requestPayload, headers);
            
            ResponseEntity<AiAlternativeResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/alternatives-v4",
                    requestEntity,
                    AiAlternativeResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch alternatives from AI service: {}", e.getMessage(), e);
            return AiAlternativeResponse.builder()
                    .message("The AI service is unavailable. Reason: " + e.getMessage())
                    .alternatives(new ArrayList<>())
                    .build();
        }
    }

    public AiPredictResponse predictTherapeuticClass(AiPredictRequest req) {
        log.info("Predicting therapeutic class for patientId: {}, indication: {}, weight: {}", req.getPatientId(), req.getIndication(), req.getWeight());

        Double age = 30.0;
        String gender = "M";

        if (req.getPatientId() != null) {
            User patient = userRepo.findById(req.getPatientId()).orElse(null);
            if (patient != null) {
                if (patient.getGender() != null) {
                    gender = patient.getGender().toUpperCase().startsWith("F") ? "F" : "M";
                }
                if (patient.getDateOfBirth() != null) {
                    age = (double) Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();
                }
            }
        }

        Double weight = (req.getWeight() != null && req.getWeight() > 0) ? req.getWeight() : 75.0;

        // ─── Récupérer les médicaments actuels du patient ────────────────────
        List<String> medicamentsActuels = new ArrayList<>();
        if (req.getPatientId() != null) {
            try {
                List<Prescription> recentPrescriptions = prescriptionRepo.findByPatientId(req.getPatientId());
                // Prendre les 3 prescriptions les plus récentes
                recentPrescriptions.stream()
                    .limit(3)
                    .forEach(p -> {
                        if (p.getMedicines() != null) {
                            p.getMedicines().forEach(m -> {
                                if (m.getMedicineName() != null) {
                                    medicamentsActuels.add(m.getMedicineName());
                                }
                            });
                        }
                    });
                log.info("Patient {} a {} médicaments actuels: {}", req.getPatientId(), medicamentsActuels.size(), medicamentsActuels);
            } catch (Exception e) {
                log.warn("Impossible de récupérer les médicaments actuels: {}", e.getMessage());
            }
        }

        // Ajouter aussi les médicaments fournis manuellement par Angular
        if (req.getMedicamentsActuels() != null) {
            medicamentsActuels.addAll(req.getMedicamentsActuels());
        }

        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("patient_age", age);
        requestPayload.put("patient_poids", weight);
        requestPayload.put("patient_sexe", gender);
        requestPayload.put("symptome", req.getIndication() == null ? "" : req.getIndication());
        requestPayload.put("medicaments_actuels", medicamentsActuels);

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestPayload, headers);
            
            ResponseEntity<AiPredictResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/predict",
                    requestEntity,
                    AiPredictResponse.class
            );

            return response.getBody();
        } catch (HttpClientErrorException e) {
            // Flask returned 422 (input non medical) — extract the error message body
            log.warn("Flask AI rejected input (HTTP {}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                AiPredictResponse errResponse = mapper.readValue(e.getResponseBodyAsString(), AiPredictResponse.class);
                return errResponse;
            } catch (Exception parseEx) {
                return AiPredictResponse.builder()
                        .error("Indication non reconnue")
                        .message(e.getResponseBodyAsString())
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to predict class using AI service: {}", e.getMessage(), e);
            return AiPredictResponse.builder()
                    .error("The AI predictive service is unavailable.")
                    .message("Reason: " + e.getMessage())
                    .build();
        }
    }
}
