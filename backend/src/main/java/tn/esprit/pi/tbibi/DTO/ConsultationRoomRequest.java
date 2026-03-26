package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationRoomRequest {
    private Integer teleconsultationId;
    private LocalDateTime expiresAt;
}
