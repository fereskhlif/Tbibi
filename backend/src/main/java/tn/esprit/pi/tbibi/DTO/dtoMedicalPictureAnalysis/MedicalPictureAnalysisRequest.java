package tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalPictureAnalysisRequest {

    private String history;
    private Integer laboratoryResultId;
}