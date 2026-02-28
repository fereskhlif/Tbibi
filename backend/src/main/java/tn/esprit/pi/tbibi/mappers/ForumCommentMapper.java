package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.forumcomment.ForumCommentRequest;
import tn.esprit.pi.tbibi.DTO.forumcomment.ForumCommentResponse;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostRequest;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostResponse;
import tn.esprit.pi.tbibi.entities.ForumComment;
import tn.esprit.pi.tbibi.entities.ForumPost;

@Mapper(componentModel = "spring")
public interface ForumCommentMapper {
    ForumComment toEntity(ForumCommentRequest request);
    @Mapping(source = "author.userId", target = "authorId")
    @Mapping(source = "author.name", target = "authorName")
    @Mapping(source = "post.postId", target = "postId")
    ForumCommentResponse toDto(ForumComment comment);
}