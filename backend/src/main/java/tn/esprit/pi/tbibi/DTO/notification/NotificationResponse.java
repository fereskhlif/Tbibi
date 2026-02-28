package tn.esprit.pi.tbibi.DTO.notification;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    Long notificationId;
    String message;
    Boolean isRead;
    LocalDateTime createdAt;
    Long recipientId;
    Long postId;
    String postTitle;
    Long commentId;
}