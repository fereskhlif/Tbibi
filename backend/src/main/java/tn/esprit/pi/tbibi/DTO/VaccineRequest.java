package tn.esprit.pi.tbibi.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VaccineRequest {
    private String nom;
    private String type;
    private String observation;
}
