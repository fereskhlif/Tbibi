package tn.esprit.pi.tbibi.services;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;
import tn.esprit.pi.tbibi.entities.EmailTemplateName;
import tn.esprit.pi.tbibi.entities.Token;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.RoleRepo;
import tn.esprit.pi.tbibi.repositories.TokenRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.entities.Role;
import tn.esprit.pi.tbibi.security.CustomUserDetailsService;
import tn.esprit.pi.tbibi.security.jwt.JwtService;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class IAuthServiceImp implements IAuthService {

    private final UserRepo userRepository;
    private final RoleRepo roleRepository;
    private final TokenRepo tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${application.mailing.frontend.activation-url}")
    private String activationUrl;

    @Override
    public void register(RegisterRequest req) throws MessagingException {
        if (req.email() == null || req.email().isBlank()) {
            throw new IllegalArgumentException("Email required");
        }
        if (userRepository.findByEmail(req.email()).isPresent()) {
            throw new IllegalArgumentException("Email already used");
        }
        if (req.password() == null || req.password().length() < 6) {
            throw new IllegalArgumentException("Password must contain at least 6 characters");
        }
        if (req.roleName() == null) {
            throw new IllegalArgumentException("Role required");
        }

        Role role = roleRepository.findByRoleName(req.roleName());
        if (role == null) {
            role = new Role();
            role.setRoleName(req.roleName().toUpperCase());
            role = roleRepository.save(role);
        }

        User u = User.builder()
                .name(req.name() == null ? "Not Available" : req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(role)
                .enabled(true) // Temp: bypass email verification
                .build();

        userRepository.save(u);
        sendValidationEmail(u);
    }

    private void sendValidationEmail(User u) throws MessagingException {
        // just generates and saves the token, nothing else
        String newToken = generateAndSaveActivationToken(u);

        emailService.sendEmail(
                u.getEmail(),
                u.getName(),
                EmailTemplateName.ACTIVATE_ACCOUNT,
                activationUrl + "?token=" + newToken,
                newToken,
                "Account activation");
    }

    private String generateAndSaveActivationToken(User u) {
        // generates the code, saves it as a Token entity, returns it
        String generatedCode = generateActivationCode(6);

        Token token = Token.builder()
                .token(generatedCode)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .user(u)
                .build();

        tokenRepository.save(token);
        return generatedCode;
    }

    private String generateActivationCode(int length) {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom();

        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }

        return codeBuilder.toString();
    } // closing brace was missing — login() was trapped inside this method

    public void activateAccount(String code) throws MessagingException {
        Token token = tokenRepository.findByToken(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid activation code"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            sendValidationEmail(token.getUser());
            throw new IllegalStateException("Activation code expired. A new code has been sent to your email.");
        }

        User user = token.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        token.setValidatedAt(LocalDateTime.now());
        tokenRepository.save(token);
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(req.email());

        // Temp: bypass email verification
        // if (!userDetails.isEnabled()) {
        // throw new IllegalStateException("Account not activated. Please check your
        // email.");
        // }

        String token = jwtService.generateToken(userDetails);

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No roles found"))
                .getAuthority();

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        return new AuthResponse(token, userDetails.getUsername(), role, user.getUserId());
    }
}