package tn.esprit.pi.tbibi.controllers;

<<<<<<< HEAD
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;
import tn.esprit.pi.tbibi.security.CustomUserDetailsService;
import tn.esprit.pi.tbibi.security.jwt.JwtService;
import tn.esprit.pi.tbibi.services.IAuthService;

import java.util.Map;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
=======
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;
import tn.esprit.pi.tbibi.services.IAuthService;

@Slf4j
@RestController
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;
<<<<<<< HEAD
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        log.info("Test endpoint hit!");
        return ResponseEntity.ok("Auth controller is working!");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        log.info("=== REGISTRATION ATTEMPT ===");
        log.info("Email: {}", req.email());
        log.info("Role: {}", req.roleName());

        try {
            var saved = authService.register(req);
            log.info("User registered successfully: {}", saved.getEmail());
            return ResponseEntity.ok("User created: " + saved.getEmail());
        } catch (IllegalArgumentException e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            log.error("Registration failed with exception:", e);
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
=======

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody @Valid RegisterRequest request
    ) {
        try {
            authService.register(request);
            return ResponseEntity.accepted().build();
        } catch (IllegalArgumentException e) {
            if ("Email already used".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed.");
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
        }
    }

    @PostMapping("/login")
<<<<<<< HEAD
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        log.info("=== LOGIN ATTEMPT ===");
        log.info("Email: {}", req.email());

        try {
            AuthResponse response = authService.login(req);
            log.info("Login successful for: {}", req.email());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/test-login")
    public ResponseEntity<?> testLogin(@RequestBody LoginRequest req) {
        log.info("=== TEST LOGIN ===");
        log.info("Email: {}", req.email());

        try {
            // Tentative d'authentification
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );

            // Si on arrive ici, l'authentification a réussi
            UserDetails userDetails = userDetailsService.loadUserByUsername(req.email());
            String token = jwtService.generateToken(userDetails);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Authentication successful",
                    "token", token,
                    "email", req.email()
            ));
        } catch (BadCredentialsException e) {
            log.error("Bad credentials for user: {}", req.email());
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid email or password"
            ));
        } catch (Exception e) {
            log.error("Authentication failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Authentication failed: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/check-password")
    public ResponseEntity<?> checkPassword(
            @RequestParam String email,
            @RequestParam String rawPassword) {

        log.info("=== CHECK PASSWORD ===");
        log.info("Email: {}", email);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, rawPassword)
            );

            return ResponseEntity.ok(Map.of(
                    "email", email,
                    "passwordMatches", true,
                    "message", "Password is correct"
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.ok(Map.of(
                    "email", email,
                    "passwordMatches", false,
                    "message", "Password is incorrect"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "email", email,
                    "passwordMatches", false,
                    "message", "Error: " + e.getMessage()
            ));
        }
    }
=======
    public ResponseEntity<?> login(
            @RequestBody @Valid LoginRequest req) {
        try {
            return ResponseEntity.ok(authService.login(req));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
    }

    @GetMapping("/activate-account")
    public ResponseEntity<String> confirm(
            @RequestParam String token
    ) {
        try {
            authService.activateAccount(token);
            return ResponseEntity.ok("Account activated successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.GONE).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during activation.");
        }
    }

>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
}