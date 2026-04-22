package tn.esprit.pi.tbibi.DTO;

public record AuthResponse(
                String token,
                String email,
                String role,
                Integer userId,
<<<<<<< Updated upstream
                String name) {
=======
                Long pharmacyId) {
>>>>>>> Stashed changes
}
