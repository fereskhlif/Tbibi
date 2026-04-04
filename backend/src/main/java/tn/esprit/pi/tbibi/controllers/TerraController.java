package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.TerraVitalsDTO;
import tn.esprit.pi.tbibi.DTO.TerraWidgetDTO;
import tn.esprit.pi.tbibi.services.TerraService;

import java.util.Map;

/**
 * REST controller for Terra smartwatch API integration.
 *
 * Endpoints:
 *  POST /api/terra/connect/{patientId}  — generate Terra widget session URL
 *  GET  /api/terra/vitals/{patientId}   — get latest vitals for a patient
 *  GET  /api/terra/status/{patientId}   — check if patient has a connected device
 *  DELETE /api/terra/disconnect/{patientId} — disconnect patient's device
 *  POST /api/terra/webhook              — Terra webhook receiver (called by Terra servers)
 */
@Slf4j
@RestController
@RequestMapping("/api/terra")
@RequiredArgsConstructor
public class TerraController {

    private final TerraService terraService;

    /**
     * Step 1 of connection flow:
     * Patient clicks "Connect Smartwatch" → Angular calls this → gets widget URL → opens it.
     */
    @PostMapping("/connect/{patientId}")
    public ResponseEntity<TerraWidgetDTO> connect(@PathVariable Integer patientId) {
        TerraWidgetDTO result = terraService.generateWidgetSession(patientId);
        return ResponseEntity.ok(result);
    }

    /**
     * Angular polls this every 3 seconds while monitoring is active.
     * Returns the latest cached vitals from Terra.
     * If the patient has no connected device, deviceConnected=false is returned.
     */
    @GetMapping("/vitals/{patientId}")
    public ResponseEntity<TerraVitalsDTO> getVitals(@PathVariable Integer patientId) {
        return ResponseEntity.ok(terraService.getVitals(patientId));
    }

    /**
     * Quick status check — used by Angular on page load to show
     * "Connect Smartwatch" or current device state.
     */
    @GetMapping("/status/{patientId}")
    public ResponseEntity<Map<String, Object>> status(@PathVariable Integer patientId) {
        boolean connected = terraService.isConnected(patientId);
        if (connected) {
            TerraVitalsDTO v = terraService.getVitals(patientId);
            return ResponseEntity.ok(Map.of(
                    "connected", true,
                    "provider", v.getProvider() != null ? v.getProvider() : "UNKNOWN"
            ));
        }
        return ResponseEntity.ok(Map.of("connected", false));
    }

    /**
     * Disconnect a patient's Terra device.
     */
    @DeleteMapping("/disconnect/{patientId}")
    public ResponseEntity<Void> disconnect(@PathVariable Integer patientId) {
        terraService.disconnect(patientId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Terra Webhook endpoint.
     * Terra calls this URL automatically when:
     *  - A patient authenticates via the widget (type=auth)
     *  - New health data is available (type=activity, daily, body, sleep)
     *  - A patient deauthorizes (type=deauth)
     *
     * Must return HTTP 200 quickly — Terra will retry if it doesn't get a response.
     * In production, add HMAC signature verification via the terra-signature header.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "terra-signature", required = false) String signature) {

        log.info("Terra webhook received (signature present: {})", signature != null);

        // TODO for production: verify HMAC signature with your Terra signing secret
        // String signingSecret = "your-signing-secret";
        // if (!verifySignature(payload, signature, signingSecret)) {
        //     return ResponseEntity.status(401).body("Invalid signature");
        // }

        // Process async so we respond quickly to Terra
        try {
            terraService.handleWebhook(payload);
        } catch (Exception e) {
            log.error("Error handling Terra webhook: {}", e.getMessage());
        }

        return ResponseEntity.ok("OK");
    }
}
