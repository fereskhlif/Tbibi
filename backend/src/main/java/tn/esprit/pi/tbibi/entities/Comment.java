package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import tn.esprit.pi.tbibi.entities.Post;
import tn.esprit.pi.tbibi.entities.User;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"author", "post", "parentComment"})
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long commentId;

    @Column(columnDefinition = "TEXT")
    String comment;
    LocalDateTime commentDate;
    LocalDateTime updatedDate;

    // ⭐ CHANGED: Removed columnDefinition
    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    Boolean deleted = false;

    @Builder.Default
    @Column(name = "is_pinned", nullable = false)
    boolean pinned = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    Comment parentComment;
}