package tn.esprit.pi.tbibi.mappers;


import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.DTO.forumcategory.ForumCategoryResponse;
import tn.esprit.pi.tbibi.entities.ForumCategory;

@Mapper(componentModel = "spring")
public interface ForumCategoryMapper {
    ForumCategoryResponse toDto(ForumCategory category);
}
