package tn.esprit.pi.tbibi.DTO.post;

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
public class PostRequest {
    @NotBlank(message = "Post title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    String title;

    @NotBlank(message = "Post content is required")
    @Size(min = 10, message = "Content must be at least 10 characters long")
    String content;

    @NotNull(message = "Category is required")
    Long categoryId;

    @NotNull(message = "Author ID is required")
    Integer authorId;
}