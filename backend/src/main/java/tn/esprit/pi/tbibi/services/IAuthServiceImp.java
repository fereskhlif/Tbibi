package tn.esprit.pi.tbibi.services;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import tn.esprit.pi.tbibi.entities.Role;
import tn.esprit.pi.tbibi.entities.Token;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.RoleRepo;
import tn.esprit.pi.tbibi.repositories.TokenRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.security.CustomUserDetailsService;
import tn.esprit.pi.tbibi.security.jwt.JwtService;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
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
        log.info("=== REGISTRATION ATTEMPT ===");
        log.info("Email: {}", req.email());

        // Validation de l'email
        if (req.email() == null || req.email().isBlank()) {
            throw new IllegalArgumentException("Email required");
        }

        // Vérifier si l'email existe déjà
        if (userRepository.findByEmail(req.email()).isPresent()) {
            throw new IllegalArgumentException("Email already used");
        }

        // Validation du mot de passe
        if (req.password() == null || req.password().length() < 6) {
            throw new IllegalArgumentException("Password must contain at least 6 characters");
        }

        // Validation du rôle
        if (req.roleName() == null || req.roleName().isBlank()) {
            throw new IllegalArgumentException("Role required");
        }

        // Convertir le nom du rôle en majuscules
        String roleNameUpper = req.roleName().toUpperCase();
        log.info("Looking for role: {}", roleNameUpper);

        // Chercher le rôle par son nom
        Role role = roleRepository.findByRoleName(roleNameUpper);

        // Si le rôle n'existe pas, le créer
        if (role == null) {
            log.info("Role not found, creating new role: {}", roleNameUpper);
            role = new Role();
            role.setRoleName(roleNameUpper);
            role = roleRepository.save(role);
            log.info("New role created with ID: {}", role.getRole_id());
        } else {
            log.info("Role found with ID: {}", role.getRole_id());
        }

        // Déterminer le statut selon le rôle
        tn.esprit.pi.tbibi.entities.UserStatus status = tn.esprit.pi.tbibi.entities.UserStatus.ACTIVE;
        if (roleNameUpper.equals("MEDECIN") || roleNameUpper.equals("DOCTEUR") || roleNameUpper.equals("DOCTOR") ||
            roleNameUpper.equals("PHARMACIEN") || roleNameUpper.equals("PHARMASIS") || roleNameUpper.equals("PHARMACIST") ||
            roleNameUpper.equals("LABORATOIRE") || roleNameUpper.equals("LABORATORY") || 
            roleNameUpper.equals("KINE") || roleNameUpper.equals("PHYSIOTHERAPIST")) {
            status = tn.esprit.pi.tbibi.entities.UserStatus.PENDING;
        }

        // Sauvegarder le document s'il existe
        String documentPath = null;
        if (req.documentBase64() != null && !req.documentBase64().isBlank() && 
            req.documentName() != null && !req.documentName().isBlank()) {
            
            try {
                // S'assurer que le dossier existe
                java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads/documents");
                if (!java.nio.file.Files.exists(uploadDir)) {
                    java.nio.file.Files.createDirectories(uploadDir);
                }

                // Générer un nom unique
                String extension = "";
                int extIndex = req.documentName().lastIndexOf('.');
                if (extIndex > 0) {
                    extension = req.documentName().substring(extIndex);
                }
                String uniqueFilename = java.util.UUID.randomUUID().toString() + extension;
                java.nio.file.Path targetPath = uploadDir.resolve(uniqueFilename);

                // Décoder la chaîne Base64 (extraire les données s'il y a un en-tête data URI)
                String base64Data = req.documentBase64();
                if (base64Data.contains(",")) {
                    base64Data = base64Data.split(",")[1];
                }
                
                byte[] decodedBytes = java.util.Base64.getDecoder().decode(base64Data);
                java.nio.file.Files.write(targetPath, decodedBytes);
                
                documentPath = uniqueFilename;
                log.info("Document saved successfully: {}", documentPath);
            } catch (Exception e) {
                log.error("Failed to save document for user {}", req.email(), e);
            }
        }

        // Créer l'utilisateur avec le builder
        User user = User.builder()
                .name(req.name() == null ? "Not Available" : req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .dateOfBirth(req.dateOfBirth())
                .gender(req.gender())
                .adresse(req.adresse())
                .specialty(req.specialty())
                .role(role)
                .accountStatus(status)
                .enabled(true) // Email verification disabled, user is enabled by default
                .profilePicture(documentPath) // Save document name in profilePicture for admin view
                .build();

        log.info("Saving user with role: {}", role.getRoleName());

        // Sauvegarder l'utilisateur
        User savedUser = userRepository.save(user);
        log.info("User saved successfully with ID: {}", savedUser.getUserId());

        // sendValidationEmail(savedUser); // Disabled email verification
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
    }

    public void activateAccount(String code) throws MessagingException {
        log.info("=== ACTIVATION ATTEMPT ===");
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
        log.info("Account activated for user: {}", user.getEmail());
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        log.info("=== LOGIN ATTEMPT ===");
        log.info("Email: {}", req.email());

        try {
            // Authentifier l'utilisateur
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );

            // Charger les détails de l'utilisateur
            UserDetails userDetails = userDetailsService.loadUserByUsername(req.email());

            // Générer le token JWT
            String token = jwtService.generateToken(userDetails);

            // Récupérer le rôle
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("No roles found"))
                    .getAuthority();

            // Nettoyer le rôle (enlever "ROLE_" si présent)
            if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }

            // Récupérer l'utilisateur pour son ID
            User user = userRepository.findByEmail(req.email())
                    .orElseThrow(() -> new IllegalStateException("User not found"));

            log.info("Login successful for user: {}, role: {}", req.email(), role);

            return new AuthResponse(token, userDetails.getUsername(), role, user.getUserId());

        } catch (org.springframework.security.authentication.DisabledException e) {
            log.error("Login disabled for user {}: account not activated or approved yet.", req.email());
            throw new IllegalStateException("Your account is not activated. Please check your email to confirm, or wait for admin approval.");
        } catch (Exception e) {
            log.error("Login failed for user {}: {}", req.email(), e.getMessage());
            throw new RuntimeException("Bad credentials");
        }
    }
}