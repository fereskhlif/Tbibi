package tn.esprit.pi.tbibi.DTO.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentRequest {
    @NotBlank(message = "Comment content is required")
    @Size(min = 1, max = 2000, message = "Comment must be between 1 and 2000 characters")
    String comment;

    @NotNull(message = "Author is required")
    Integer authorId;

    @NotNull(message = "Post is required")
    Long postId;

    Long parentCommentId; // null if top level
}