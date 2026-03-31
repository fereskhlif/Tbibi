package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.vote.VoteRequest;
import tn.esprit.pi.tbibi.DTO.vote.VoteResponse;
import tn.esprit.pi.tbibi.entities.Vote;

@Mapper(componentModel = "spring")
public interface VoteMapper {
    Vote toEntity(VoteRequest request);

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.name", target = "userName")
    @Mapping(source = "post.postId", target = "postId")
    VoteResponse toDto(Vote vote);
}