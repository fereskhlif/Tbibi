package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeleconsultationRequest {
    private Long appointmentId;
    private String notes;
}
