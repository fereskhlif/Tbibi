package tn.esprit.pi.tbibi.DTO;

public record AuthResponse(
        String token,
        String email,
        String role,
        Integer userId,
        String name,
        String profilePicture,
        String accountStatus
) {
    // Constructor for backward compatibility (without name, profilePicture, accountStatus)
    public AuthResponse(String token, String email, String role, Integer userId) {
        this(token, email, role, userId, null, null, "ACTIVE");
    }
}
