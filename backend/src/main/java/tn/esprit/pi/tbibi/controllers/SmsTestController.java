package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.services.TwilioSmsService;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Diagnostic controller to test Twilio SMS configuration.
 * Remove or secure this endpoint before deploying to production.
 */
@RestController
@RequestMapping("/api/debug/sms")
@RequiredArgsConstructor
@Slf4j
public class SmsTestController {

    private final TwilioSmsService twilioSmsService;

    @Value("${twilio.account-sid:NOT_SET}")
    private String accountSid;

    @Value("${twilio.phone-number:NOT_SET}")
    private String fromNumber;

    /**
     * Test endpoint: POST /api/debug/sms/test
     * Body: { "to": "+21612345678", "message": "Test SMS" }
     *
     * Returns full success/error details from Twilio.
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testSms(@RequestBody Map<String, String> body) {
        Map<String, Object> result = new LinkedHashMap<>();

        String toPhone = body.getOrDefault("to", "").trim();
        String message = body.getOrDefault("message", "Tbibi SMS test - " + System.currentTimeMillis());

        // Normalize phone number
        if (!toPhone.isBlank() && !toPhone.startsWith("+")) {
            toPhone = "+216" + toPhone.replaceAll("\\s+", "");
        } else {
            toPhone = toPhone.replaceAll("\\s+", "");
        }

        result.put("twilioAccountSid", accountSid.substring(0, Math.min(accountSid.length(), 10)) + "...");
        result.put("twilioFromNumber", fromNumber);
        result.put("toPhone", toPhone);
        result.put("messagePreview", message);

        if (toPhone.isBlank()) {
            result.put("status", "ERROR");
            result.put("error", "No phone number provided. Send body: {\"to\": \"+21612345678\"}");
            return ResponseEntity.badRequest().body(result);
        }

        try {
            twilioSmsService.sendSms(toPhone, message);
            result.put("status", "SUCCESS");
            result.put("message", "SMS sent successfully to " + toPhone);
            log.info("[SMS_TEST] SMS sent successfully to {}", toPhone);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            result.put("status", "FAILED");
            result.put("error", e.getMessage());
            result.put("hint", getTwilioHint(e.getMessage()));
            log.error("[SMS_TEST] SMS failed to {}: {}", toPhone, e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    private String getTwilioHint(String errorMsg) {
        if (errorMsg == null) return "";
        if (errorMsg.contains("21608") || errorMsg.contains("unverified"))
            return "TRIAL ACCOUNT: You must verify the destination phone number at https://console.twilio.com/us1/develop/phone-numbers/manage/verified";
        if (errorMsg.contains("20003") || errorMsg.contains("authenticate"))
            return "WRONG CREDENTIALS: Check account SID and auth token in application.properties";
        if (errorMsg.contains("21211") || errorMsg.contains("not a valid"))
            return "INVALID PHONE NUMBER: Use international format with country code e.g. +21622123456";
        if (errorMsg.contains("21212"))
            return "INVALID FROM NUMBER: The Twilio phone number in application.properties is wrong";
        if (errorMsg.contains("21606"))
            return "From number not capable of SMS. Check your Twilio phone number capabilities.";
        return "Check https://www.twilio.com/docs/errors/" + (errorMsg.contains("Error") ? errorMsg.replaceAll(".*Error (\\d+).*", "$1") : "");
    }
}
