package tn.esprit.pi.tbibi.DTO.comment;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private Long commentId;
    private String comment;
    private LocalDateTime commentDate;
    private LocalDateTime updatedDate;
    Boolean isDeleted;
    boolean isPinned;
    public Boolean getIsDeleted() { return isDeleted; }
    public boolean getIsPinned() { return isPinned; }

    private Integer authorId;
    private String authorName;
    private Long postId;
    private Long parentCommentId;  // ← explicit private, no @FieldDefaults
    private List<CommentResponse> replies;
    int voteCount;
    boolean userHasVoted;
}