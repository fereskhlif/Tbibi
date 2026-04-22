package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Proxies disease risk prediction requests to the Python AI service.
 *
 *  POST /api/disease-risk/predict  → Python POST /predict-risk
 *  GET  /api/disease-risk/features → Python GET  /predict-risk/features
 */
@Slf4j
@RestController
@RequestMapping("/api/disease-risk")
@RequiredArgsConstructor
public class DiseaseRiskController {

    private final RestTemplate restTemplate;

    @Value("${gemma.service.url:http://localhost:5000}")
    private String pythonBaseUrl;

    /**
     * Predict disease risk for a patient.
     * Body: { age, bmi, systolic_bp, fasting_glucose, smoking,
     *         physical_activity, family_history, cholesterol }
     */
    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestBody Map<String, Object> body) {
        String url = pythonBaseUrl + "/predict-risk";
        log.info("🔮 Forwarding disease risk prediction to Python: {}", url);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(url, request, Map.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());

        } catch (Exception ex) {
            log.error("Disease risk prediction failed: {}", ex.getMessage());
            return ResponseEntity.status(503).body(Map.of(
                "error", "AI prediction service unavailable. Make sure Python service is running.",
                "hint",  "cd tbibi-gemma-service && python train_disease_model.py && python main.py"
            ));
        }
    }

    /**
     * Returns the feature schema (min/max/mean for each input field).
     * Used by the Angular form to pre-populate field ranges.
     */
    @GetMapping("/features")
    public ResponseEntity<?> features() {
        String url = pythonBaseUrl + "/predict-risk/features";
        try {
            return ResponseEntity.ok(restTemplate.getForObject(url, Map.class));
        } catch (Exception ex) {
            return ResponseEntity.status(503).body(Map.of(
                "error", "AI service unavailable"
            ));
        }
    }
}
