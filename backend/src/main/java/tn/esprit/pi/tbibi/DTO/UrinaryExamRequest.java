package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrinaryExamRequest {
    private String libelle;
    private String date;
    private String malAnt;
    private String categorie;
    private String nTabMp;
    private String dDec;
    private String aCausal;
}
