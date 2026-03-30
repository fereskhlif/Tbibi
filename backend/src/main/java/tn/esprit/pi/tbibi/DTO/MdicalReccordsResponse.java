package tn.esprit.pi.tbibi.DTO;
import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MdicalReccordsResponse {
    private int medicalfile_id;
    private String imageLabo;
    private String result_ia;
    private String medical_historuy;
    private String chronic_diseas;
    private String rep_doc;
    private String imageUrl;
    private List<ActeResponse> actes;
<<<<<<< HEAD
=======
    private List<String> patientImages;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
}
