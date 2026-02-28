package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostRequest;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostResponse;
import tn.esprit.pi.tbibi.entities.ForumPost;

@Mapper(componentModel = "spring")
public interface ForumPostMapper {
    ForumPost toEntity(ForumPostRequest request);
    @Mapping(source = "author.userId", target = "authorId")
    @Mapping(source = "author.name", target = "authorName")
    @Mapping(source = "category.categoryId", target = "categoryId")
    @Mapping(source = "category.categoryName", target = "categoryName")
    ForumPostResponse toDto(ForumPost post);
}