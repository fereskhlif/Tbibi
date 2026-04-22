package tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientLabStatisticsDTO {
    private Integer patientId;
    private String patientName;
    private String patientEmail;
    private Long totalTests;
    private Long completedTests;
    private Long pendingTests;
    private Long urgentTests;
    private Double completionRate;
}
