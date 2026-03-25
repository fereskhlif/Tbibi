package tn.esprit.pi.tbibi.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.pi.tbibi.entities.UserStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateStatusRequest {
    private UserStatus status;
}
