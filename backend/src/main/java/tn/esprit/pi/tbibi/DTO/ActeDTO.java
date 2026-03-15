package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActeDTO {
    private int acteId;
    private String description;
    private String typeOfActe;
    private Integer patientId;
    private String patientName;
}