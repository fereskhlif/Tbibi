package tn.esprit.pi.tbibi.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.DoctorInitiatedAppointmentRequest;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory OTP store for doctor-initiated appointments.
 * Each OTP expires after 10 minutes.
 */
@Slf4j
@Service
public class DoctorApptOtpService {

    private static final long OTP_TTL_MS = 10 * 60 * 1000L; // 10 minutes

    private record OtpEntry(
            String code,
            DoctorInitiatedAppointmentRequest request,
            Instant expiresAt
    ) {}

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final Random random = new Random();

    /**
     * Generates a 6-digit OTP, stores it linked to the appointment request,
     * and returns the OTP key (UUID) and code.
     */
    public OtpResult generate(DoctorInitiatedAppointmentRequest request) {
        // Clean expired entries lazily
        store.entrySet().removeIf(e -> Instant.now().isAfter(e.getValue().expiresAt()));

        String key  = UUID.randomUUID().toString();
        String code = String.format("%06d", random.nextInt(999_999));
        store.put(key, new OtpEntry(code, request, Instant.now().plusMillis(OTP_TTL_MS)));
        log.info("[OTP] Generated OTP for key={} patientId={}", key, request.getPatientId());
        return new OtpResult(key, code);
    }

    /**
     * Validates the OTP. Returns the linked request if valid, throws otherwise.
     */
    public DoctorInitiatedAppointmentRequest verify(String key, String code) {
        OtpEntry entry = store.get(key);
        if (entry == null) {
            throw new IllegalArgumentException("Code expiré ou invalide. Veuillez renvoyer un nouveau code.");
        }
        if (Instant.now().isAfter(entry.expiresAt())) {
            store.remove(key);
            throw new IllegalArgumentException("Le code a expiré (10 min). Veuillez en demander un nouveau.");
        }
        if (!entry.code().equals(code.trim())) {
            throw new IllegalArgumentException("Code incorrect. Veuillez réessayer.");
        }
        store.remove(key); // single-use
        log.info("[OTP] Verified OTP for key={}", key);
        return entry.request();
    }

    public record OtpResult(String key, String code) {}
}
