package tn.esprit.pi.tbibi.DTO.forumcategory;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForumCategoryResponse {
    Long categoryId;
    String categoryName;
    String categoryDescription;
}