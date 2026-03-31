package tn.esprit.pi.tbibi.DTO.post;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    Long postId;
    String title;
    String content;
    LocalDateTime createdDate;
    LocalDateTime updatedDate;
    Integer views;
    String postStatus;
    Boolean isPinned;   // ← must match mapper target
    Boolean isDeleted;

    public Boolean getIsPinned() {
        return isPinned;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }
    Integer authorId;
    String authorName;
    Long categoryId;
    String categoryName;
    Integer commentCount;
    Integer voteCount;

    private List<String> mediaUrls;


}