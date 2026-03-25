package tn.esprit.pi.tbibi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.pi.tbibi.entities.Role;
import tn.esprit.pi.tbibi.entities.UserStatus;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserAdminResponse {
    private int userId;
    private String name;
    private String email;
    private Role role;
    private LocalDate dateOfBirth;
    private String gender;
    private UserStatus accountStatus;
    private Boolean enabled;
}
