package tn.esprit.pi.tbibi.DTO;

import java.time.LocalDate;

public record UserProfileDTO(
        int userId,
        String name,
        String email,
        String adresse,
        LocalDate dateOfBirth,
        String gender,
        String profilePicture,
        String roleName
) {
}
