package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.forumcategory.ForumCategoryResponse;
import java.util.List;

public interface IForumCategoryService {
    ForumCategoryResponse getCategoryById(Long id);
    List<ForumCategoryResponse> getAllCategories();
}