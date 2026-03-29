package tn.esprit.pi.tbibi.DTO.vote;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoteResponse {
    Long voteId;
    Integer userId;
    String userName;
    Long postId;
    LocalDateTime createdAt;
}