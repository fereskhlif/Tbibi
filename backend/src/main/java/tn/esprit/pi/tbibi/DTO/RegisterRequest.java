package tn.esprit.pi.tbibi.DTO;



public record RegisterRequest(
        String name,
        String email,
        String password,
        String roleName
)
{ }
