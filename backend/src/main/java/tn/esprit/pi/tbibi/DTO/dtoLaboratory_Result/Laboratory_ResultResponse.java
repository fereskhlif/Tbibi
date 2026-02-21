package tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Laboratory_ResultResponse {

    private Integer labId;
    private String testName;
    private String location;
    private String nameLabo;
    private String resultValue;
    private String status;
    private LocalDate testDate;
    private Integer patientId;
    private String patientFullName;
}