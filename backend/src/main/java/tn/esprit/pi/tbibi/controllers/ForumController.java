package tn.esprit.pi.tbibi.controllers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.post.*;
import tn.esprit.pi.tbibi.DTO.category.*;
import tn.esprit.pi.tbibi.DTO.comment.*;
import tn.esprit.pi.tbibi.DTO.vote.*;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.services.IForumService;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class ForumController {

    IForumService forumService;

    // ─── Category ─────────────────────────────────────────────────────────────

    @PostMapping("/categories")                          // ← CREATE category
    public CategoryResponse createCategory(@RequestBody @Valid CategoryRequest request) {
        return forumService.createCategory(request);
    }

    @GetMapping("/categories")                           // ← GET all categories
    public List<CategoryResponse> getAllCategories() {
        return forumService.getAllCategories();
    }

    @PutMapping("/categories/{id}")
    public CategoryResponse updateCategory(@PathVariable("id") Long id, @RequestBody @Valid CategoryRequest request) {
        return forumService.updateCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable("id") Long id) {
        forumService.deleteCategory(id);
    }

// ─── Post ─────────────────────────────────────────────────────────────────

    @GetMapping("/posts")
    public List<PostResponse> getAllPosts() {
        return forumService.getAllPosts();
    }

    @GetMapping("/posts/paginated")
    @Transactional
    public Page<PostResponse> getAllPostsPaginated(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "latest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = createPageable(page, size, sortBy);
        return forumService.getAllPostsPaginated(status, pageable);
    }

    @PostMapping("/posts")                               // ← CREATE post
    public PostResponse createPost(@RequestBody @Valid PostRequest request) {
        return forumService.createPost(request);
    }

    @GetMapping("/posts/{id}")
    public PostResponse getPostById(@PathVariable("id") Long id) {
        return forumService.getPostById(id);
    }

    @GetMapping("/posts/category/{categoryId}")
    public List<PostResponse> getPostsByCategory(@PathVariable("categoryId") Long categoryId) {
        return forumService.getPostsByCategory(categoryId);
    }

    @GetMapping("/posts/category/{categoryId}/paginated")
    @Transactional
    public Page<PostResponse> getPostsByCategoryPaginated(
            @PathVariable("categoryId") Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "latest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = createPageable(page, size, sortBy);
        return forumService.getPostsByCategoryPaginated(categoryId, status, pageable);
    }

    @GetMapping("/posts/author/{authorId}")
    public List<PostResponse> getPostsByAuthor(@PathVariable("authorId") Integer authorId) {
        return forumService.getPostsByAuthor(authorId);
    }

    @GetMapping("/posts/search")
    public List<PostResponse> searchPosts(@RequestParam("keyword") String keyword) {
        return forumService.searchPosts(keyword);
    }

    @GetMapping("/posts/search/paginated")
    @Transactional
    public Page<PostResponse> searchPostsPaginated(
            @RequestParam("keyword") String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "latest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = createPageable(page, size, sortBy);
        return forumService.searchPostsPaginated(keyword, status, pageable);
    }

    @GetMapping("/posts/category/{categoryId}/stats")
    public java.util.Map<String, Long> getCategoryStats(@PathVariable("categoryId") Long categoryId) {
        return forumService.getCategoryStats(categoryId);
    }

    // ─── Private Helper ───
    private Pageable createPageable(int page, int size, String sortBy) {
        Sort sort;
        if ("most_voted".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("voteCount").descending(); // Note: This requires a formula or specific field in Entity
        } else if ("newest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("createdDate").descending();
        } else {
            // Default: "latest" activity (pinned first, then newest)
            sort = Sort.by("pinned").descending().and(Sort.by("createdDate").descending());
        }
        return PageRequest.of(page, size, sort);
    }

    @PutMapping("/posts/{id}")
    public PostResponse updatePost(@PathVariable("id") Long id, @RequestBody @Valid PostRequest request) {
        return forumService.updatePost(id, request);
    }

    @PutMapping("/posts/{id}/status")
    public PostResponse updatePostStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        return forumService.updatePostStatus(id, status);
    }

    @PutMapping("/posts/{id}/pin")
    public PostResponse togglePin(@PathVariable("id") Long id) {
        return forumService.togglePin(id);
    }

    @DeleteMapping("/posts/{id}")
    public void deletePost(@PathVariable("id") Long id) {
        forumService.deletePost(id);
    }

// ─── Comment ──────────────────────────────────────────────────────────────

    @PostMapping("/comments")                            // ← ADD comment
    public CommentResponse addComment(@RequestBody @Valid CommentRequest request) {
        return forumService.addComment(request);
    }


    @GetMapping("/comments/post/{postId}")
    public List<CommentResponse> getCommentsByPost(@PathVariable("postId") Long postId) {
        return forumService.getCommentsByPost(postId);
    }

    @PutMapping("/comments/{id}")
    public CommentResponse updateComment(@PathVariable("id") Long id, @RequestParam("comment") String comment) {
        return forumService.updateComment(id, comment);
    }

    @DeleteMapping("/comments/{id}")
    public void deleteComment(@PathVariable("id") Long id) {
        forumService.deleteComment(id);
    }

    @PutMapping("/comments/{id}/pin")
    public CommentResponse togglePinComment(@PathVariable Long id, @RequestParam Integer userId) {
        return forumService.togglePinComment(id, userId);
    }

// ─── Vote ─────────────────────────────────────────────────────────────────

    @PostMapping("/votes")                               // ← VOTE on post
    public VoteResponse votePost(@RequestBody VoteRequest request) {
        return forumService.votePost(request);
    }

    @DeleteMapping("/votes")
    public void unvotePost(@RequestParam("userId") Integer userId, @RequestParam("postId") Long postId) {
        forumService.unvotePost(userId, postId);
    }

    @GetMapping("/votes/count/{postId}")
    public long getVoteCount(@PathVariable("postId") Long postId) {
        return forumService.getVoteCount(postId);
    }

    @GetMapping("/votes/check")
    public boolean hasUserVoted(@RequestParam("userId") Integer userId, @RequestParam("postId") Long postId) {
        return forumService.hasUserVoted(userId, postId);
    }

    @PostMapping(value = "/posts/{id}/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PostResponse uploadPostMedia(
            @PathVariable("id") Long postId,
            @RequestParam("files") List<MultipartFile> files) {
        return forumService.uploadPostMedia(postId, files);
    }


    // ─── Comment Vote ─────────────────────────────────────────────────────────

    @PostMapping("/comments/votes")
    public CommentVoteResponse voteComment(@RequestBody CommentVoteRequest request) {
        return forumService.voteComment(request);
    }

    @DeleteMapping("/comments/votes")
    public void unvoteComment(@RequestParam("userId") Integer userId, @RequestParam("commentId") Long commentId) {
        forumService.unvoteComment(userId, commentId);
    }

    @GetMapping("/posts/{postId}/voted-comments")
    public List<Long> getUserVotedComments(@RequestParam("userId") Integer userId, @PathVariable("postId") Long postId) {
        return forumService.getUserVotedComments(userId, postId);
    }
}