package tn.esprit.pi.tbibi.DTO.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CommentVoteRequest {
    private Integer userId;
    private Long commentId;
}
