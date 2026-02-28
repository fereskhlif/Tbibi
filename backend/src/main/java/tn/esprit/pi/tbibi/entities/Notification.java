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
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long notificationId;

    String message;

    Boolean isRead;

    LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    NotificationType type;

    String redirectUrl;;

    @ManyToOne
    User recipient;

}