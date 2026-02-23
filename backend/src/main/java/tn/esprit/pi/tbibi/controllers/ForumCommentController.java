package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.forumcomment.ForumCommentRequest;
import tn.esprit.pi.tbibi.DTO.forumcomment.ForumCommentResponse;
import tn.esprit.pi.tbibi.services.IForumCommentService;

@RestController
@RequestMapping("/api/forum/comments")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class ForumCommentController {

    IForumCommentService commentService;

    @PostMapping
    public ForumCommentResponse create(@RequestBody ForumCommentRequest request) {
        return commentService.createComment(request);
    }

    @GetMapping("/{id}")
    public ForumCommentResponse getById(@PathVariable Long id) {
        return commentService.getCommentById(id);
    }

    @PutMapping("/{id}")
    public ForumCommentResponse update(@PathVariable Long id, @RequestBody ForumCommentRequest request) {
        return commentService.updateComment(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        commentService.deleteComment(id);
    }
}
