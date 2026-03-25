package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActeDTO {
    private int acteId;
    private String description;
    private String typeOfActe;
    private Date date;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
}