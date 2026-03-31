package tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class MedicalPictureAnalysisRequest {

    private String history;
    private Integer laboratoryResultId;

    // Image Information
    private String imageName;
    private String imageType;       // JPG, PNG, DICOM
    private String imagePath;
    private String category;        // Radio, Scanner, IRM, Echographie

    // Analysis & Results
    private String analysisResult;
    private Double confidenceScore;
    private String status;          // Pending, Validated, Rejected
    private String doctorNote;

    // Dates
    private LocalDate uploadDate;
    private LocalDate validationDate;
}