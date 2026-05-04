package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tn.esprit.pi.tbibi.DTO.comment.CommentRequest;
import tn.esprit.pi.tbibi.DTO.comment.CommentResponse;
import tn.esprit.pi.tbibi.entities.Comment;
import tn.esprit.pi.tbibi.entities.User;

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
    @Mapping(target = "expert", ignore = true)
    @Mapping(target = "roleName", ignore = true)
    CommentResponse toDto(Comment comment);

    @AfterMapping
    default void setExpertFields(Comment comment, @MappingTarget CommentResponse.CommentResponseBuilder dto) {
        User author = comment.getAuthor();
        if (author != null && author.getRole() != null) {
            String rawRole = author.getRole().getRoleName();
            String normalizedRole = "PATIENT";
            
            if (rawRole != null) {
                if (rawRole.equals("DOCTOR") || rawRole.equals("MEDECIN") || rawRole.equals("DOCTEUR")) {
                    normalizedRole = "DOCTOR";
                } else if (rawRole.equals("PHARMACIST") || rawRole.equals("PHARMACIEN") || rawRole.equals("PHARMASIS")) {
                    normalizedRole = "PHARMACIST";
                } else if (rawRole.equals("LABORATORY") || rawRole.equals("LABORATOIRE")) {
                    normalizedRole = "LABORATORY";
                } else if (rawRole.equals("PHYSIOTHERAPIST") || rawRole.equals("KINE")) {
                    normalizedRole = "PHYSIOTHERAPIST";
                } else {
                    normalizedRole = rawRole;
                }
            }

            dto.roleName(normalizedRole);
            dto.expert(
                    normalizedRole.equals("DOCTOR") ||
                    normalizedRole.equals("PHARMACIST") ||
                    normalizedRole.equals("LABORATORY") ||
                    normalizedRole.equals("PHYSIOTHERAPIST")
            );
        } else {
            dto.expert(false);
            dto.roleName("PATIENT");
        }
    }
}