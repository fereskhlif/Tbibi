package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.services.IForumAdminService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/forum")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ForumAdminController {

    private final IForumAdminService forumAdminService;

    // ── READ ────────────────────────────────────────────────────────────────

    // GET /admin/forum/posts?verdict=ALL|TOXIC|UNCERTAIN|CLEAN
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "ALL") String verdict) {
        return ResponseEntity.ok(forumAdminService.getPostsForAdmin(verdict));
    }

    // GET /admin/forum/posts/{postId}/comments
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(forumAdminService.getCommentsForAdmin(postId));
    }

    // GET /admin/forum/stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(forumAdminService.getToxicityStats());
    }

    // ── DELETE ──────────────────────────────────────────────────────────────

    // DELETE /admin/forum/posts/{postId}  — removes entire post + comments
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(@PathVariable Long postId) {
        return ResponseEntity.ok(forumAdminService.adminDeletePost(postId));
    }

    // DELETE /admin/forum/comments/{commentId}  — removes one comment
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(forumAdminService.adminDeleteComment(commentId));
    }

    // DELETE /admin/forum/comments  body: [1, 2, 3]  — removes many comments
    @DeleteMapping("/comments")
    public ResponseEntity<Map<String, Object>> deleteComments(@RequestBody List<Long> commentIds) {
        return ResponseEntity.ok(forumAdminService.adminDeleteComments(commentIds));
    }
}