package tn.esprit.pi.tbibi.DTO.forumcomment;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForumCommentResponse {
    Long commentId;
    String comment;
    LocalDateTime commentDate;
    Integer authorId;
    String authorName;
    Long postId;
}