package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;
import tn.esprit.pi.tbibi.services.IAuthService;

@RestController
@CrossOrigin("*")
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        var saved = authService.register(req);
        return ResponseEntity.ok("User created: " + saved.getEmail());

    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));

    }

}