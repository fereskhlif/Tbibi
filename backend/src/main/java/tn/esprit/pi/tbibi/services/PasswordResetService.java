package tn.esprit.pi.tbibi.services;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.apache.commons.codec.digest.DigestUtils;
import tn.esprit.pi.tbibi.entities.PasswordResetToken;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.PasswordRestTokenRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepo userRepository;
    private final PasswordRestTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    // Rate limiting: max 3 requests per hour per email
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket getBucket(String email) {
        return buckets.computeIfAbsent(email, k -> Bucket.builder()
                .addLimit(Bandwidth.simple(3, Duration.ofHours(1)))
                .build());
    }

    @Transactional
    public void sendResetLink(String email) {
        // 1. Rate limit check
        Bucket bucket = getBucket(email);
        if (!bucket.tryConsume(1)) {
            throw new RuntimeException("Too many requests, please try again later");
        }

        // 2. Find user — silent if not found (prevent email enumeration)
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return; // don't reveal if email exists or not
        }
        User user = userOpt.get();

        // Delete old token if exists
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);
        tokenRepository.flush();

        // 4. Generate raw token and hash it
        String rawToken = UUID.randomUUID().toString();
        String hashedToken = DigestUtils.sha256Hex(rawToken);

        // 5. Save hashed token in DB
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(hashedToken);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        tokenRepository.save(resetToken);

        // 6. Send raw token in email (not the hash)
        String resetLink = "http://localhost:4200/reset-password?token=" + rawToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom("yourgmail@gmail.com");
        message.setSubject("Reset Your Password");
        message.setText("Hello,\n\n"
                + "Click the link below to reset your password:\n\n"
                + resetLink + "\n\n"
                + "This link expires in 1 hour.\n\n"
                + "If you didn't request this, ignore this email.");

        mailSender.send(message);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        // 1. Hash the incoming token and look it up in DB
        String hashedToken = DigestUtils.sha256Hex(rawToken);
        PasswordResetToken resetToken = tokenRepository.findByToken(hashedToken)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        // 2. Check expiry
        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Token expired, please request a new one");
        }

        // 3. Update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 4. Delete token (one time use)
        tokenRepository.delete(resetToken);
    }
}
