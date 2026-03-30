package tn.esprit.pi.tbibi.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import tn.esprit.pi.tbibi.entities.Category;
import tn.esprit.pi.tbibi.entities.Comment;
import tn.esprit.pi.tbibi.entities.PostStatus;
import tn.esprit.pi.tbibi.entities.User;

import org.hibernate.annotations.Formula;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"comments", "author", "category"})
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long postId;

    String title;
    @Column(columnDefinition = "TEXT")
    String content;
    LocalDateTime createdDate;
    LocalDateTime updatedDate;
    Integer views;

    // ⭐ CHANGED: Removed columnDefinition
    @Builder.Default
    @Column(name = "is_pinned", nullable = false)
    boolean pinned = false;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    boolean deleted = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "post_status", length = 20)
    PostStatus postStatus;

    @Formula("(SELECT COUNT(*) FROM votes v WHERE v.post_id = post_id)")
    Integer voteCount;

    @Formula("(SELECT COUNT(*) FROM comments c WHERE c.post_id = post_id AND c.is_deleted = false)")
    Integer commentCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    Category category;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "post")
    @JsonIgnore
    List<Comment> comments;

    @ElementCollection
    @CollectionTable(name = "post_media", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "media_url")
    @Builder.Default
    List<String> mediaUrls = new ArrayList<>();
}