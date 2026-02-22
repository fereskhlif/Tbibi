package tn.esprit.pi.tbibi.DTO;

import tn.esprit.pi.tbibi.entities.Role;

public record RegisterRequest(
        String name,
        String email,
        String password,
        String roleName
)
{ }
