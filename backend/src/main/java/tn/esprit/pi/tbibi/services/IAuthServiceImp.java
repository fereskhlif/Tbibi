package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.RoleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.entities.Role;
import tn.esprit.pi.tbibi.security.CustomUserDetailsService;
import tn.esprit.pi.tbibi.security.jwt.JwtService;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class IAuthServiceImp implements IAuthService {

    private final UserRepo userRepository;
    private final RoleRepo roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Override
    public User register(RegisterRequest req) {
        log.info("=== REGISTRATION ATTEMPT ===");
        log.info("Email: {}", req.email());
        log.info("Role name from request: {}", req.roleName());

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

        // Créer l'utilisateur avec le builder
        User user = User.builder()
                .name(req.name() == null ? "Not Available" : req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(role)
                .enabled(true)
                .build();

        log.info("Saving user with role: {}", role.getRoleName());

        // Sauvegarder l'utilisateur
        User savedUser = userRepository.save(user);
        log.info("User saved successfully with ID: {}", savedUser.getUserId()); // Utilisez getUserId() ici

        return savedUser;
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

            log.info("Login successful for user: {}, role: {}", req.email(), role);

            return new AuthResponse(token, userDetails.getUsername(), role);

        } catch (Exception e) {
            log.error("Login failed for user {}: {}", req.email(), e.getMessage());
            throw new RuntimeException("Bad credentials");
        }
    }
}