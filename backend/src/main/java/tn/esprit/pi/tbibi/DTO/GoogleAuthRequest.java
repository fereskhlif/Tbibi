package tn.esprit.pi.tbibi.DTO;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String idToken;
    private String role; // PATIENT, DOCTEUR, KINE, PHARMASIS, LABORATORY
}
