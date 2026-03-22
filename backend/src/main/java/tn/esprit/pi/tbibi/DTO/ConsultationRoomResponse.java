package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationRoomResponse {
    private Integer roomId;
    private String roomCode;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
