package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.ChronicConditionRequest;
import tn.esprit.pi.tbibi.DTO.ChronicConditionResponse;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.services.ChronicConditionService;
import tn.esprit.pi.tbibi.services.EmailService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chronic")
@RequiredArgsConstructor
public class ChronicConditionController {

    private final ChronicConditionService service;
    private final EmailService emailService;
    private final UserRepo userRepo;

    /** Create a new reading */
    @PostMapping
    public ResponseEntity<ChronicConditionResponse> create(@RequestBody ChronicConditionRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    /** Update an existing reading */
    @PutMapping("/{id}")
    public ResponseEntity<ChronicConditionResponse> update(@PathVariable Long id,
                                                            @RequestBody ChronicConditionRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    /** Delete a reading */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** All readings for a specific patient */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ChronicConditionResponse>> byPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getByPatient(patientId));
    }

    /** All readings recorded by a doctor */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ChronicConditionResponse>> byDoctor(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(service.getByDoctor(doctorId));
    }

    /** Only CRITICAL readings for a doctor's patients */
    @GetMapping("/doctor/{doctorId}/critical")
    public ResponseEntity<List<ChronicConditionResponse>> critical(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(service.getCriticalByDoctor(doctorId));
    }

    /** Real-time severity check without saving (for live preview in UI) */
    @PostMapping("/check-severity")
    public ResponseEntity<String> checkSeverity(@RequestBody ChronicConditionRequest req) {
        return ResponseEntity.ok(service.computeSeverity(req.getConditionType(), req.getValue(), req.getValue2()));
    }

    /**
     * Send a health WARNING email to a patient.
     * Body: { "to": "patient@email.com", "patientName": "John", "vitalType": "BLOOD_SUGAR",
     *         "value": "105 mg/dL", "message": "..." }
     */
    @PostMapping("/warn-email")
    public ResponseEntity<String> sendWarningEmail(@RequestBody Map<String, String> body) {
        try {
            Long patientId = body.containsKey("patientId") ? Long.parseLong(body.get("patientId")) : null;
            String to = body.get("to"); // Fallback if provided

            // Use patient ID to get real email if available
            if (patientId != null) {
                Optional<User> patient = userRepo.findById(patientId);
                if (patient.isPresent() && patient.get().getEmail() != null) {
                    to = patient.get().getEmail();
                }
            }

            String patientName = body.getOrDefault("patientName", "Patient");
            String vitalType = body.getOrDefault("vitalType", "Vital");
            String value = body.getOrDefault("value", "");
            String message = body.getOrDefault("message", "");

            String html = "<div style='font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #fcd34d;border-radius:12px;background:#fffbeb'>"
                    + "<h2 style='color:#d97706;margin-bottom:8px'>⚠️ Tbibi — Health Warning Alert</h2>"
                    + "<p style='color:#374151'>Hello <b>" + patientName + "</b>,</p>"
                    + "<p style='color:#374151'>Your smartwatch has detected a <b>WARNING</b> level reading for <b>" + vitalType + "</b>.</p>"
                    + "<div style='background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0;font-size:18px;font-weight:bold;color:#92400e;text-align:center'>" + value + "</div>"
                    + "<p style='color:#374151'>" + message + "</p>"
                    + "<p style='color:#374151'>Please contact your doctor if symptoms persist or worsen.</p>"
                    + "<hr style='border:none;border-top:1px solid #fcd34d;margin:24px 0'/>"
                    + "<p style='color:#9ca3af;font-size:12px'>This is an automated alert from your Tbibi health monitoring system.</p>"
                    + "</div>";

            jakarta.mail.internet.MimeMessage mimeMessage = emailService.getMailSender().createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper =
                new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage,
                    org.springframework.mail.javamail.MimeMessageHelper.MULTIPART_MODE_MIXED,
                    java.nio.charset.StandardCharsets.UTF_8.name());
            helper.setFrom("firasabdeljaouad@gmail.com");
            if (to != null) helper.setTo(to);
            helper.setSubject("⚠️ Health Warning — " + vitalType + " Alert | Tbibi");
            helper.setText(html, true);
            emailService.getMailSender().send(mimeMessage);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error sending email: " + e.getMessage());
        }
        return ResponseEntity.ok("Email sent successfully");
    }
}
