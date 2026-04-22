package tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalPictureAnalysisResponse {

    private Integer picId;
    private String history;

    // Relation Laboratory Result
    private Integer laboratoryResultId;
    private String testName;
    private String nameLabo;

    // Image Information
    private String imageName;
    private String imageType;
    private String imagePath;
    private String category;

    // Analysis & Results
    private String analysisResult;
    private Double confidenceScore;
    private String status;
    private String doctorNote;

    // Dates
    private LocalDate uploadDate;
    private LocalDate validationDate;
}