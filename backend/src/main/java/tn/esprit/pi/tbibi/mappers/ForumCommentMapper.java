package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostRequest;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostResponse;
import tn.esprit.pi.tbibi.entities.ForumPost;

@Mapper(componentModel = "spring")
public interface ForumCommentMapper {
    ForumPost toEntity(ForumPostRequest request);
    ForumPostResponse toDto(ForumPost post);
}