package tn.esprit.pi.tbibi.DTO.forumpost;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForumPostRequest {
    String title;
    String content;
    String postStatus;
    Long authorId;
    Long categoryId;
}
