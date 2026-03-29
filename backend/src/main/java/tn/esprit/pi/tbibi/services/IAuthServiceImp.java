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

        // PATIENT → ACTIVE directement, autres rôles → PENDING (validation admin)
        UserStatus initialStatus = roleNameUpper.equals("PATIENT")
                ? UserStatus.ACTIVE
                : UserStatus.PENDING;

        User user = User.builder()
                .name(req.name() == null ? "Not Available" : req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(role)
                .dateOfBirth(req.dateOfBirth())
                .gender(req.gender())
                .adresse(req.adresse())
                .accountStatus(initialStatus)
                .enabled(true)
                .build();

        log.info("Saving user with role: {}, initial status: {}", role.getRoleName(), initialStatus);
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

        // ✅ Get userId from database
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