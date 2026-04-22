package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.PatientFeatureVector;
import tn.esprit.pi.tbibi.DTO.RiskSegmentationResponse;
import tn.esprit.pi.tbibi.services.RiskSegmentationService;

import java.util.Map;

/**
 * REST endpoints for Patient Risk Segmentation.
 *
 *  GET  /api/risk-segmentation                → run Python K-Means and return all 3 clusters
 *  GET  /api/risk-segmentation/patient/{id}   → risk profile + care plan for a single patient
 */
@Slf4j
@RestController
@RequestMapping("/api/risk-segmentation")
@RequiredArgsConstructor
public class RiskSegmentationController {

    private final RiskSegmentationService service;

    /**
     * Run the full K-Means segmentation (via Python AI service)
     * across all patients who have at least one ChronicCondition reading.
     */
    @GetMapping
    public ResponseEntity<?> runSegmentation() {
        try {
            RiskSegmentationResponse result = service.run();
            return ResponseEntity.ok(result);
        } catch (RuntimeException ex) {
            log.error("Segmentation failed: {}", ex.getMessage());
            return ResponseEntity.status(503).body(
                Map.of("error", ex.getMessage(),
                       "hint",  "Make sure the Python AI service is running: cd tbibi-gemma-service && python main.py")
            );
        }
    }

    /**
     * Return the risk profile + care plan for a single patient.
     * Runs the full clustering then filters to the requested patient.
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> patientRisk(@PathVariable Integer patientId) {
        try {
            RiskSegmentationResponse full = service.run();
            return full.getClusters().stream()
                    .flatMap(c -> c.getPatients().stream())
                    .filter(p -> p.getPatientId() != null && p.getPatientId().equals(patientId))
                    .findFirst()
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException ex) {
            log.error("Segmentation failed for patient {}: {}", patientId, ex.getMessage());
            return ResponseEntity.status(503).body(
                Map.of("error", ex.getMessage())
            );
        }
    }
}
