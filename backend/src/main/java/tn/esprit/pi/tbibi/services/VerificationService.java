package tn.esprit.pi.tbibi.services;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.VerificationRequest;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory verification code storage for email-based verification.
 * For production, use Redis or a database with expiry.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class VerificationService {

    private static final int CODE_LENGTH = 4;
    private static final long EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

    private final Map<String, PendingVerification> pending = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private final EmailService emailService;

    public String createVerification(VerificationRequest request) {
        String code = generateCode();
        String id = java.util.UUID.randomUUID().toString();
        pending.put(id, new PendingVerification(request, code, System.currentTimeMillis()));

        String email = request.getPatientEmail();
        if (email != null && !email.isBlank()) {
            try {
                emailService.sendVerificationCode(email, request.getPatientName(), code);
                log.info("Verification code sent by email to {} for patient {}", email, request.getPatientName());
            } catch (MessagingException e) {
                log.error("Failed to send verification email to {}: {}", email, e.getMessage());
            }
        } else {
            // Fallback: log the code so it's visible in dev/testing
            log.warn("No email provided for patient {}. Verification code: {}", request.getPatientName(), code);
        }
        return id;
    }

    public PendingVerification consume(String verificationId, String code) {
        PendingVerification pv = pending.get(verificationId);
        if (pv == null) {
            throw new IllegalArgumentException("Verification expired or invalid");
        }
        if (System.currentTimeMillis() - pv.createdAt > EXPIRY_MS) {
            pending.remove(verificationId);
            throw new IllegalArgumentException("Verification code expired");
        }
        if (!pv.code.equals(code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }
        pending.remove(verificationId);
        return pv;
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    public record PendingVerification(VerificationRequest request, String code, long createdAt) {
    }
}
