package tn.esprit.pi.tbibi.DTO.forumpost;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForumPostResponse {
    Long postId;
    String title;
    String content;
    LocalDateTime createdDate;
    Integer views;
    String postStatus;
    Integer authorId;
    String authorName;
    Long categoryId;
    String categoryName;
}
