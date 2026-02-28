package tn.esprit.pi.tbibi.DTO.forumcomment;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForumCommentRequest {
    String comment;
    Integer authorId;
    Long postId;
}
