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
                    body
            ).create();
            
            log.info("[Twilio] SMS sent to {} - SID: {}", to, message.getSid());
        } catch (Exception e) {
            log.error("[Twilio] Failed to send SMS to {}: {}", to, e.getMessage());
            throw new RuntimeException("Twilio SMS sending failed: " + e.getMessage(), e);
        }
    }
}
