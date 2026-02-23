package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.forumcategory.ForumCategoryResponse;
import tn.esprit.pi.tbibi.services.IForumCategoryService;
import java.util.List;

@RestController
@RequestMapping("/api/forum/categories")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class ForumCategoryController {

    IForumCategoryService categoryService;

    @GetMapping("/{id}")
    public ForumCategoryResponse getById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @GetMapping
    public List<ForumCategoryResponse> getAll() {
        return categoryService.getAllCategories();
    }
}