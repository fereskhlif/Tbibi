package tn.esprit.pi.tbibi.services;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TwilioSmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isBlank() && authToken != null && !authToken.isBlank()) {
            try {
                Twilio.init(accountSid, authToken);
                log.info("Twilio initialized successfully");
            } catch (Exception e) {
                log.error("Failed to initialize Twilio: {}", e.getMessage());
            }
        } else {
            log.warn("Twilio credentials not fully configured in application.properties");
        }
    }

    public void sendSms(String to, String body) {
        if (accountSid == null || accountSid.isBlank() || accountSid.contains("YOUR_TWILIO")) {
            log.warn("Twilio is not configured. SMS to {} was not sent. Body: {}", to, body);
            return;
        }

        try {
            Message message = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(fromNumber),
                    body).create();

            // Check message status for delivery issues
            if (message.getErrorCode() != null) {
                log.error("[Twilio] SMS to {} FAILED with Twilio error code {} - {}", to, message.getErrorCode(),
                        message.getErrorMessage());
                throw new RuntimeException("Twilio error " + message.getErrorCode() + ": " + message.getErrorMessage());
            }
            log.info("[Twilio] SMS sent to {} - SID: {} - Status: {}", to, message.getSid(), message.getStatus());
        } catch (com.twilio.exception.ApiException e) {
            // Twilio API error with specific error code
            log.error("[Twilio] API Error {} sending SMS to {}: {} — Hint: {}",
                    e.getCode(), to, e.getMessage(), getTwilioErrorHint(e.getCode()));
            throw new RuntimeException("Twilio error " + e.getCode() + ": " + e.getMessage() + " | Hint: "
                    + getTwilioErrorHint(e.getCode()), e);
        } catch (RuntimeException e) {
            // Re-throw if already a RuntimeException (from error code check above)
            throw e;
        } catch (Exception e) {
            log.error("[Twilio] Unexpected error sending SMS to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Twilio SMS sending failed: " + e.getMessage(), e);
        }
    }

    private String getTwilioErrorHint(int code) {
        return switch (code) {
            case 21608 -> "TRIAL ACCOUNT: Add the destination number as a Verified Caller ID at console.twilio.com";
            case 21211 -> "Invalid 'To' phone number. Use E.164 format: +21612345678";
            case 21212 -> "Invalid 'From' number. Check twilio.phone-number in application.properties";
            case 21606 -> "Twilio 'From' number cannot send SMS. Verify SMS capability in Twilio Console";
            case 20003 -> "Authentication failed. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN";
            case 21614 -> "'To' phone number is not mobile or cannot receive SMS";
            default -> "See https://www.twilio.com/docs/errors/" + code;
        };
    }
}
