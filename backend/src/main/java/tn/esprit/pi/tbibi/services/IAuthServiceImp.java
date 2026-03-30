package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;
import tn.esprit.pi.tbibi.entities.Role;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.entities.UserStatus;
import tn.esprit.pi.tbibi.repositories.RoleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.security.CustomUserDetailsService;
import tn.esprit.pi.tbibi.security.jwt.JwtService;

@Slf4j
@Service
@RequiredArgsConstructor
public class IAuthServiceImp implements IAuthService {

    private final UserRepo userRepository;
    private final RoleRepo roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Override
    public User register(RegisterRequest req) {
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

        String roleNameUpper = req.roleName().toUpperCase();
        Role role = roleRepository.findByRoleName(roleNameUpper);
        if (role == null) {
            role = new Role();
            role.setRoleName(roleNameUpper);
            role = roleRepository.save(role);
        }

        // Determine status based on role
        tn.esprit.pi.tbibi.entities.UserStatus status = tn.esprit.pi.tbibi.entities.UserStatus.ACTIVE;
        if (roleNameUpper.equals("MEDECIN") || roleNameUpper.equals("DOCTEUR") || roleNameUpper.equals("DOCTOR") ||
            roleNameUpper.equals("PHARMACIEN") || roleNameUpper.equals("PHARMASIS") || roleNameUpper.equals("PHARMACIST") ||
            roleNameUpper.equals("LABORATOIRE") || roleNameUpper.equals("LABORATORY") || 
            roleNameUpper.equals("KINE") || roleNameUpper.equals("PHYSIOTHERAPIST")) {
            status = tn.esprit.pi.tbibi.entities.UserStatus.PENDING;
        }

        // Save document if provided
        String documentPath = null;
        if (req.documentBase64() != null && !req.documentBase64().isBlank() && 
            req.documentName() != null && !req.documentName().isBlank()) {
            
            try {
                // Ensure directory exists
                java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads/documents");
                if (!java.nio.file.Files.exists(uploadDir)) {
                    java.nio.file.Files.createDirectories(uploadDir);
                }

                // Generate unique filename
                String extension = "";
                int extIndex = req.documentName().lastIndexOf('.');
                if (extIndex > 0) {
                    extension = req.documentName().substring(extIndex);
                }
                String uniqueFilename = java.util.UUID.randomUUID().toString() + extension;
                java.nio.file.Path targetPath = uploadDir.resolve(uniqueFilename);

                // Decode Base64 (extract data if there's a data URI header)
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

        // Create user with builder
        User user = User.builder()
                .name(req.name() == null ? "Not Available" : req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(role)
                .dateOfBirth(req.dateOfBirth())
                .gender(req.gender())
                .adresse(req.adresse())
                .specialty(req.specialty())
                .accountStatus(status)
                .enabled(true)
                .profilePicture(documentPath)
                .build();

        log.info("Saving user with role: {}, initial status: {}", role.getRoleName(), status);
        User savedUser = userRepository.save(user);
        log.info("User saved successfully with ID: {}", savedUser.getUserId());

        return savedUser;
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        log.info("Login attempt for email: {}", req.email());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );
            log.info("Authentication successful for: {}", req.email());
        } catch (Exception e) {
            log.error("Authentication failed for {}: {}", req.email(), e.getMessage());
            throw e;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(req.email());
        String token = jwtService.generateToken(userDetails);

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No roles found"))
                .getAuthority();

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        return new AuthResponse(
            token,
            userDetails.getUsername(),
            role,
            user.getUserId(),
            user.getName(),
            user.getProfilePicture(),
            user.getAccountStatus() != null ? user.getAccountStatus().toString() : "ACTIVE"
        );
    }
}
