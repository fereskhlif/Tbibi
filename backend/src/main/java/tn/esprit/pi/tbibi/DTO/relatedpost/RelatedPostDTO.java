package tn.esprit.pi.tbibi.DTO.relatedpost;

import lombok.*;
import tn.esprit.pi.tbibi.entities.PostStatus;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelatedPostDTO {
    Long postId;
    String title;
    String authorName;
    String categoryName;
    Integer voteCount;
    Integer commentCount;
    Integer views;
    PostStatus postStatus;
    LocalDateTime createdDate;
    int relevanceScore;
}