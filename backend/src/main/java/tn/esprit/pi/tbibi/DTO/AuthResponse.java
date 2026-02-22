package tn.esprit.pi.tbibi.DTO;

public record AuthResponse(
        String token,
        String email,
        String role
) {
}
