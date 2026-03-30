package tn.esprit.pi.tbibi.DTO.notification;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long notificationId;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String type;
    private String redirectUrl;
    private Integer recipientId;
}