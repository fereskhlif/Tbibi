package tn.esprit.pi.tbibi.DTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MdicalReccordsRequest {
    private String imageLabo;
    private String result_ia;
    private String medical_historuy;
    private String chronic_diseas;
    private String rep_doc;
}