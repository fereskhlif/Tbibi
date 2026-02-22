package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.RoleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.entities.Role;

import tn.esprit.pi.tbibi.security.CustomUserDetailsService;
import tn.esprit.pi.tbibi.security.jwt.JwtService;

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
                .enabled(true)
                .build();

        return userRepository.save(u);
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(req.email());

        String token = jwtService.generateToken(userDetails);

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No roles found"))
                .getAuthority();

        return new AuthResponse(token, userDetails.getUsername(), role);
    }
}