package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActeRequest {
    private Date date;
    private String description;
    private String typeOfActe;
}