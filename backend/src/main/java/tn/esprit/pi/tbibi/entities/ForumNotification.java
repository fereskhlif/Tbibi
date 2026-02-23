package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@AllArgsConstructor
@Entity
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForumNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long notificationId;
    String message;
    Boolean isRead;
    LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    User recipient;

    @ManyToOne
    @JoinColumn(name = "post_id")
    ForumPost post;

    @ManyToOne
    @JoinColumn(name = "comment_id")
    ForumComment comment;
}