package tn.esprit.pi.tbibi.DTO;

import lombok.*;

<<<<<<< HEAD
=======
import java.util.Date;

>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActeDTO {
    private int acteId;
    private String description;
    private String typeOfActe;
<<<<<<< HEAD
    private Integer patientId;
    private String patientName;
=======
    private Date date;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
}