package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostRequest;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostResponse;
import tn.esprit.pi.tbibi.services.IForumPostService;
import java.util.List;

@RestController
@RequestMapping("/api/forum/posts")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class ForumPostController {

    IForumPostService postService;

    @PostMapping
    public ForumPostResponse create(@RequestBody ForumPostRequest request) {
        return postService.createPost(request);
    }

    @GetMapping("/{id}")
    public ForumPostResponse getById(@PathVariable Long id) {
        return postService.getPostById(id);
    }

    @GetMapping
    public List<ForumPostResponse> getAll() {
        return postService.getAllPosts();
    }

    @PutMapping("/{id}")
    public ForumPostResponse update(@PathVariable Long id, @RequestBody ForumPostRequest request) {
        return postService.updatePost(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        postService.deletePost(id);
    }
}