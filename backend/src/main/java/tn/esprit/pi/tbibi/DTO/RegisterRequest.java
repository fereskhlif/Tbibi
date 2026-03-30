package tn.esprit.pi.tbibi.DTO;

import tn.esprit.pi.tbibi.entities.Role;

public record RegisterRequest(
<<<<<<< HEAD
        String name,
        String email,
        String password,
        String roleName
)
{ }
=======
                String name,
                String email,
                String password,
                String roleName,
                java.time.LocalDate dateOfBirth,
                String gender,
                String adresse,
                String specialty,
                String documentBase64,
                String documentName) {
}
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
