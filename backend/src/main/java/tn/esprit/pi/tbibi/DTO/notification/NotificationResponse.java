package tn.esprit.pi.tbibi.DTO.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long notificationId;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String type;
    private String redirectUrl;
    private Integer recipientId;

    private Integer appointmentId;
    private String appointmentStatus;
}