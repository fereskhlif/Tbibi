package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@AllArgsConstructor
@Entity
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForumPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long postId;
    String title;
    String content;
    LocalDateTime createdDate;
    Integer views;

    @Enumerated(EnumType.STRING)
    PostStatus postStatus;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User author;

    @ManyToOne
    @JoinColumn(name = "category_id")
    ForumCategory category;
}
