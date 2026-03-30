package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.comment.CommentRequest;
import tn.esprit.pi.tbibi.DTO.comment.CommentResponse;
import tn.esprit.pi.tbibi.entities.Comment;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    Comment toEntity(CommentRequest request);


    @Mapping(source = "deleted", target = "isDeleted")
    @Mapping(source = "pinned", target = "isPinned")
    @Mapping(source = "author.userId", target = "authorId")
    @Mapping(source = "author.name", target = "authorName")
    @Mapping(source = "post.postId", target = "postId")
    @Mapping(source = "parentComment.commentId", target = "parentCommentId")
    @Mapping(target = "replies", expression = "java(new java.util.ArrayList<>())")
    CommentResponse toDto(Comment comment);
}