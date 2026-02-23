package tn.esprit.pi.tbibi.DTO.forumnotification;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForumNotificationResponse {
    Long notificationId;
    String message;
    Boolean isRead;
    LocalDateTime createdAt;
    Long recipientId;
    Long postId;
    String postTitle;
}