package tn.esprit.pi.tbibi.DTO.category;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryResponse {
    Long categoryId;
    String categoryName;
    String categoryDescription;
    LocalDateTime createdAt;
    Boolean active;

    public Boolean getActive() {
        return active;
    }


    Integer postCount;
}