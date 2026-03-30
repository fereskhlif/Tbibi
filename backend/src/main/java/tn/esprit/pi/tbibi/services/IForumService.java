package tn.esprit.pi.tbibi.services;


import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.comment.CommentRequest;
import tn.esprit.pi.tbibi.DTO.comment.CommentResponse;
import tn.esprit.pi.tbibi.DTO.post.PostRequest;
import tn.esprit.pi.tbibi.DTO.post.PostResponse;
import tn.esprit.pi.tbibi.DTO.category.*;
import tn.esprit.pi.tbibi.DTO.vote.VoteRequest;
import tn.esprit.pi.tbibi.DTO.vote.VoteResponse;
import tn.esprit.pi.tbibi.DTO.vote.CommentVoteRequest;
import tn.esprit.pi.tbibi.DTO.vote.CommentVoteResponse;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface IForumService {

    // Category
    CategoryResponse createCategory(CategoryRequest request);
    List<CategoryResponse> getAllCategories();
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);

    // ─── Post ─────────────────────────────────────────────────────────────────
    List<PostResponse> getAllPosts();
    Page<PostResponse> getAllPostsPaginated(String status, Pageable pageable);
    PostResponse createPost(PostRequest request);
    PostResponse getPostById(Long id);
    List<PostResponse> getPostsByCategory(Long categoryId);
    Page<PostResponse> getPostsByCategoryPaginated(Long categoryId, String status, Pageable pageable);
    List<PostResponse> getPostsByAuthor(Integer authorId);
    List<PostResponse> searchPosts(String keyword);
    Page<PostResponse> searchPostsPaginated(String keyword, String status, Pageable pageable);

    // ─── Stats ────────────────────────────────────────────────────────────────
    java.util.Map<String, Long> getCategoryStats(Long categoryId);
    PostResponse updatePost(Long id, PostRequest request);
    PostResponse updatePostStatus(Long id, String status);
    PostResponse togglePin(Long id);
    void deletePost(Long id);

    // Comment
    CommentResponse addComment(CommentRequest request);
    List<CommentResponse> getCommentsByPost(Long postId);
    CommentResponse updateComment(Long id, String newComment);
    void deleteComment(Long id);
    CommentResponse togglePinComment(Long commentId, Integer currentUserId);

    // Vote
    VoteResponse votePost(VoteRequest request);
    void unvotePost(Integer userId, Long postId);
    long getVoteCount(Long postId);
    boolean hasUserVoted(Integer userId, Long postId);
    PostResponse uploadPostMedia(Long postId, List<MultipartFile> files);

    // Comment Vote
    CommentVoteResponse voteComment(CommentVoteRequest request);
    void unvoteComment(Integer userId, Long commentId);
    List<Long> getUserVotedComments(Integer userId, Long postId);
}