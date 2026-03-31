package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.category.CategoryRequest;
import tn.esprit.pi.tbibi.DTO.category.CategoryResponse;
import tn.esprit.pi.tbibi.entities.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toEntity(CategoryRequest request);
    @Mapping(source = "active", target = "active")
    @Mapping(target = "postCount", ignore = true) // set manually in service
    CategoryResponse toDto(Category category);
}