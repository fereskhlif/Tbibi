package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDTO {
    private Integer userId;
    private String name;
    private String email;
    private String specialty;
    private String adresse;
    private String profilPicture;
}
