package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeleconsultationResponse {
    private Integer id;
    private Long appointmentId;
    private String roomUrl;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String notes;
    private Integer roomId;
    private String roomCode;
}
