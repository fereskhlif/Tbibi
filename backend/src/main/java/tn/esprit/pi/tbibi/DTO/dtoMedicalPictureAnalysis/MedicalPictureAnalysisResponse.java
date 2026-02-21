package tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalPictureAnalysisResponse {

    private Integer picId;
    private String history;
    private Integer laboratoryResultId;
    private String testName;
    private String nameLabo;
}