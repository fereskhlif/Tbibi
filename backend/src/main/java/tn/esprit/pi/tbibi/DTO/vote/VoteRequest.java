package tn.esprit.pi.tbibi.DTO.vote;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoteRequest {
    Integer userId;
    Long postId;
}