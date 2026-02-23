package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.forumcategory.ForumCategoryResponse;
import tn.esprit.pi.tbibi.mappers.ForumCategoryMapper;
import tn.esprit.pi.tbibi.repositories.ForumCategoryRepository;
import java.util.List;

@Service
@AllArgsConstructor
public class ForumCategoryService implements IForumCategoryService {

    ForumCategoryRepository categoryRepo;
    ForumCategoryMapper categoryMapper;

    @Override
    public ForumCategoryResponse getCategoryById(Long id) {
        return categoryMapper.toDto(categoryRepo.findById(id).orElseThrow());
    }

    @Override
    public List<ForumCategoryResponse> getAllCategories() {
        return categoryRepo.findAll().stream().map(categoryMapper::toDto).toList();
    }
}
