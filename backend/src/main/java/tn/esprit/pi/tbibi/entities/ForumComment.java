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
public class ForumComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long commentId;
    String comment;
    LocalDateTime commentDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User author;

    @ManyToOne
    @JoinColumn(name = "post_id")
    ForumPost post;
}
