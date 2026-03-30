package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.post.PostRequest;
import tn.esprit.pi.tbibi.DTO.post.PostResponse;
import tn.esprit.pi.tbibi.entities.Post;

@Mapper(componentModel = "spring")
public interface PostMapper {
    Post toEntity(PostRequest request);

    @Mapping(source = "pinned", target = "isPinned")
    @Mapping(source = "deleted", target = "isDeleted")
    @Mapping(source = "author.userId", target = "authorId")
    @Mapping(source = "author.name", target = "authorName")
    @Mapping(source = "category.categoryId", target = "categoryId")
    @Mapping(source = "category.categoryName", target = "categoryName")
    @Mapping(source = "postStatus", target = "postStatus")
    @Mapping(target = "commentCount", ignore = true)
    @Mapping(target = "voteCount", ignore = true)
    @Mapping(source = "mediaUrls", target = "mediaUrls")
    PostResponse toDto(Post post);

}