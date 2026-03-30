package tn.esprit.pi.tbibi.services;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.post.*;
import tn.esprit.pi.tbibi.DTO.comment.*;
import tn.esprit.pi.tbibi.DTO.category.*;
import tn.esprit.pi.tbibi.DTO.vote.*;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.exception.BusinessException;
import tn.esprit.pi.tbibi.mappers.*;
import tn.esprit.pi.tbibi.repositories.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ForumService implements IForumService {

    CategoryRepository categoryRepo;
    PostRepository postRepo;
    CommentRepository commentRepo;
    VoteRepository voteRepo;
    CommentVoteRepository commentVoteRepo;
    UserRepo userRepo;
    CategoryMapper categoryMapper;
    PostMapper postMapper;
    CommentMapper commentMapper;
    VoteMapper voteMapper;
    NotificationService notificationService;

    @Autowired
    CloudinaryService cloudinaryService;

    @Autowired
    SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public PostResponse uploadPostMedia(Long postId, List<MultipartFile> files) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        List<String> urls = cloudinaryService.uploadForumMediaFiles(files);
        if (post.getMediaUrls() == null) post.setMediaUrls(new ArrayList<>());
        post.getMediaUrls().addAll(urls);
        return mapPostWithCounts(postRepo.save(post));
    }

    // ─── Helper: map post with counts ─────────────────────────────────────────
    private PostResponse mapPostWithCounts(Post post) {
        return postMapper.toDto(post);
    }

    // ─── Helper: map comment with replies ─────────────────────────────────────
    private CommentResponse mapCommentWithReplies(Comment comment) {
        CommentResponse dto = commentMapper.toDto(comment);
        dto.setVoteCount((int) commentVoteRepo.countByComment(comment));
        List<CommentResponse> replies = commentRepo
                .findByParentCommentAndDeletedFalse(comment)
                .stream()
                .map(this::mapCommentWithReplies)
                .collect(Collectors.toList());
        dto.setReplies(replies);
        return dto;
    }

    // ─── Category ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setCategoryName(request.getCategoryName());
        category.setCategoryDescription(request.getCategoryDescription());
        category.setCreatedAt(LocalDateTime.now());
        category.setActive(true);

        Category saved = categoryRepo.save(category);

        CategoryResponse dto = categoryMapper.toDto(saved);
        dto.setPostCount(0);
        return dto;
    }

    @Override
    @Transactional
    public List<CategoryResponse> getAllCategories() {
        return categoryRepo.findByActiveTrue()
                .stream()
                .map(c -> {
                    CategoryResponse dto = categoryMapper.toDto(c);
                    dto.setPostCount(c.getPosts() != null ? c.getPosts().size() : 0);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        category.setCategoryName(request.getCategoryName());
        category.setCategoryDescription(request.getCategoryDescription());
        CategoryResponse dto = categoryMapper.toDto(categoryRepo.save(category));
        dto.setPostCount(category.getPosts() != null ? category.getPosts().size() : 0);
        return dto;
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        category.setActive(false);
        categoryRepo.save(category);
    }

    // ─── Post ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<PostResponse> getAllPosts() {
        return postRepo.findByDeletedFalseOrderByPinnedDescCreatedDateDesc()
                .stream()
                .map(this::mapPostWithCounts)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Page<PostResponse> getAllPostsPaginated(String status, Pageable pageable) {
        if (status != null && !status.equalsIgnoreCase("all")) {
            try {
                PostStatus postStatus = PostStatus.valueOf(status.toUpperCase());
                return postRepo.findByPostStatusAndDeletedFalse(postStatus, pageable)
                        .map(this::mapPostWithCounts);
            } catch (IllegalArgumentException e) {
                // Fallback to all if invalid status
            }
        }
        return postRepo.findByDeletedFalse(pageable)
                .map(this::mapPostWithCounts);
    }

    @Override
    @Transactional
    public PostResponse createPost(PostRequest request) {
        User author = userRepo.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + request.getAuthorId()));
        Category category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setMediaUrls(new ArrayList<>());
        post.setContent(request.getContent());
        post.setAuthor(author);
        post.setCategory(category);
        post.setCreatedDate(LocalDateTime.now());
        post.setUpdatedDate(LocalDateTime.now());
        post.setPostStatus(PostStatus.OPEN);
        post.setViews(0);
        post.setPinned(false);
        post.setDeleted(false);

        Post saved = postRepo.save(post);

        // ─── Notify professionals based on category ───────────────────────
        String categoryName = category.getCategoryName();
        String roleToNotify = null;
        if (categoryName.equals("Ask a Doctor")) roleToNotify = "DOCTOR";
        else if (categoryName.equals("Ask a Pharmacist")) roleToNotify = "PHARMACIST";
        else if (categoryName.equals("Ask a Lab")) roleToNotify = "LABORATORY";
        else if (categoryName.equals("Ask a Physiotherapist")) roleToNotify = "PHYSIOTHERAPIST";

        if (roleToNotify != null) {
            String url = "/forum/post/" + saved.getPostId();
            notificationService.notifyAllByRole(
                    roleToNotify,
                    author.getName() + " posted a question: \"" + saved.getTitle() + "\"",
                    NotificationType.FORUM,
                    url
            );
        }

        return mapPostWithCounts(saved);
    }

    @Override
    @Transactional
    public PostResponse getPostById(Long id) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setViews(post.getViews() + 1);
        postRepo.save(post);
        return mapPostWithCounts(post);
    }

    @Override
    @Transactional
    public List<PostResponse> getPostsByCategory(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        return postRepo
                .findByCategoryAndDeletedFalseOrderByPinnedDescCreatedDateDesc(category)
                .stream()
                .map(this::mapPostWithCounts)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Page<PostResponse> getPostsByCategoryPaginated(Long categoryId, String status, Pageable pageable) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        
        if (status != null && !status.equalsIgnoreCase("all")) {
            try {
                PostStatus postStatus = PostStatus.valueOf(status.toUpperCase());
                return postRepo.findByCategoryAndPostStatusAndDeletedFalse(category, postStatus, pageable)
                        .map(this::mapPostWithCounts);
            } catch (IllegalArgumentException e) {
                // Fallback
            }
        }
        return postRepo.findByCategoryAndDeletedFalse(category, pageable)
                .map(this::mapPostWithCounts);
    }

    @Override
    @Transactional
    public List<PostResponse> getPostsByAuthor(Integer authorId) {
        User author = userRepo.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + authorId));
        return postRepo.findByAuthorAndDeletedFalse(author)
                .stream()
                .map(this::mapPostWithCounts)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<PostResponse> searchPosts(String keyword) {
        return postRepo.findByTitleContainingIgnoreCaseAndDeletedFalse(keyword)
                .stream()
                .map(this::mapPostWithCounts)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Page<PostResponse> searchPostsPaginated(String keyword, String status, Pageable pageable) {
        if (status != null && !status.equalsIgnoreCase("all")) {
            try {
                PostStatus postStatus = PostStatus.valueOf(status.toUpperCase());
                return postRepo.findByTitleContainingIgnoreCaseAndPostStatusAndDeletedFalse(keyword, postStatus, pageable)
                        .map(this::mapPostWithCounts);
            } catch (IllegalArgumentException e) {
                // Fallback
            }
        }
        return postRepo.findByTitleContainingIgnoreCaseAndDeletedFalse(keyword, pageable)
                .map(this::mapPostWithCounts);
    }

    @Override
    @Transactional
    public java.util.Map<String, Long> getCategoryStats(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        long totalPosts = postRepo.countByCategoryAndDeletedFalse(category);
        long unansweredCount = postRepo.countUnansweredByCategory(category, PostStatus.OPEN);

        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("totalPosts", totalPosts);
        stats.put("unansweredCount", unansweredCount);
        return stats;
    }

    @Override
    @Transactional
    public PostResponse updatePost(Long id, PostRequest request) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setUpdatedDate(LocalDateTime.now());
        return mapPostWithCounts(postRepo.save(post));
    }

    @Override
    @Transactional
    public PostResponse updatePostStatus(Long id, String status) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setPostStatus(PostStatus.valueOf(status));
        return mapPostWithCounts(postRepo.save(post));
    }

    @Override
    @Transactional
    public PostResponse togglePin(Long id) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setPinned(!post.isPinned());
        return mapPostWithCounts(postRepo.save(post));
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setDeleted(true);
        postRepo.save(post);
    }

    // ─── Comment ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CommentResponse addComment(CommentRequest request) {
        User author = userRepo.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + request.getAuthorId()));
        Post post = postRepo.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + request.getPostId()));

        Comment comment = new Comment();
        comment.setComment(request.getComment());
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setCommentDate(LocalDateTime.now());
        comment.setUpdatedDate(LocalDateTime.now());
        comment.setDeleted(false);

        if (request.getParentCommentId() != null) {
            Comment parent = commentRepo.findById(request.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found with id: " + request.getParentCommentId()));
            comment.setParentComment(parent);
        }

        Comment savedComment = commentRepo.save(comment);

        // ─── Notify post author when someone else comments ────────────────
        Post commentPost = savedComment.getPost();
        User postAuthor = commentPost.getAuthor();
        User commentAuthor = savedComment.getAuthor();

        if (!postAuthor.getUserId().equals(commentAuthor.getUserId())) {
            notificationService.createAndSend(
                    postAuthor,
                    commentAuthor.getName() + " commented on your post: \"" + commentPost.getTitle() + "\"",
                    NotificationType.FORUM,
                    "/forum/post/" + commentPost.getPostId()
            );
        }

        // ─── Notify parent comment author when someone replies ────────────
        if (savedComment.getParentComment() != null) {
            User parentAuthor = savedComment.getParentComment().getAuthor();
            if (!parentAuthor.getUserId().equals(commentAuthor.getUserId())
                    && !parentAuthor.getUserId().equals(postAuthor.getUserId())) {
                notificationService.createAndSend(
                        parentAuthor,
                        commentAuthor.getName() + " replied to your comment on: \"" + commentPost.getTitle() + "\"",
                        NotificationType.FORUM,
                        "/forum/post/" + commentPost.getPostId()
                );
            }
        }

        // ─── Broadcast comment to everyone viewing this post ──────────────
        CommentResponse response = mapCommentWithReplies(savedComment);
        messagingTemplate.convertAndSend(
                "/topic/post/" + post.getPostId() + "/comments", response
        );

        return response;
    }

    @Override
    @Transactional
    public List<CommentResponse> getCommentsByPost(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        return commentRepo.findByPostAndParentCommentIsNullAndDeletedFalse(post)
                .stream()
                .map(this::mapCommentWithReplies)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommentResponse updateComment(Long id, String newComment) {
        Comment comment = commentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
        comment.setComment(newComment);
        comment.setUpdatedDate(LocalDateTime.now());
        return mapCommentWithReplies(commentRepo.save(comment));
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setDeleted(true);
        commentRepo.save(comment);
    }

    @Override
    @Transactional
    public CommentResponse togglePinComment(Long commentId, Integer currentUserId) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // 1. Authorization: Only the POST author can pin comments in that post
        if (!comment.getPost().getAuthor().getUserId().equals(currentUserId)) {
            throw new BusinessException("Only the post author can pin comments");
        }
        
        // 2. Structural: Only parent comments can be pinned
        if (comment.getParentComment() != null) {
            throw new BusinessException("Only parent comments can be pinned");
        }
        
        // 3. Logic: Toggle pinned state
        if (!comment.isPinned()) {
            // Check limit if pinning
            long pinnedCount = commentRepo.countByPostAndPinnedTrueAndDeletedFalse(comment.getPost());
            if (pinnedCount >= 3) {
                throw new BusinessException("Maximum 3 pinned comments reached. Please unpin an existing comment first.");
            }
            comment.setPinned(true);
        } else {
            comment.setPinned(false);
        }
        
        Comment saved = commentRepo.save(comment);
        return mapCommentWithReplies(saved);
    }

    // ─── Vote ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VoteResponse votePost(VoteRequest request) {
        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));
        Post post = postRepo.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + request.getPostId()));

        if (voteRepo.existsByUserAndPost(user, post)) {
            throw new RuntimeException("You already voted on this post.");
        }

        Vote vote = new Vote();
        vote.setUser(user);
        vote.setPost(post);
        vote.setCreatedAt(LocalDateTime.now());

        VoteResponse response = voteMapper.toDto(voteRepo.save(vote));

        // ─── Notify post author about the vote ───────────────────────────
        User postAuthor = post.getAuthor();
        if (!postAuthor.getUserId().equals(user.getUserId())) {
            notificationService.createAndSend(
                    postAuthor,
                    user.getName() + " voted on your post: \"" + post.getTitle() + "\"",
                    NotificationType.FORUM,
                    "/forum/post/" + post.getPostId()
            );
        }

        // ─── Broadcast updated vote count to everyone viewing this post ──
        long updatedCount = voteRepo.countByPost(post);
        messagingTemplate.convertAndSend(
                "/topic/post/" + post.getPostId() + "/votes", updatedCount
        );

        return response;
    }

    @Override
    @Transactional
    public void unvotePost(Integer userId, Long postId) {
        if (userId == null || postId == null) return;
        userRepo.findById(userId).ifPresent(user -> {
            postRepo.findById(postId).ifPresent(post -> {
                voteRepo.findByUserAndPost(user, post).ifPresent(vote -> {
                    voteRepo.delete(vote);

                    // ─── Broadcast updated vote count ─────────────────────
                    long updatedCount = voteRepo.countByPost(post);
                    messagingTemplate.convertAndSend(
                            "/topic/post/" + post.getPostId() + "/votes", updatedCount
                    );
                });
            });
        });
    }

    @Override
    public long getVoteCount(Long postId) {
        if (postId == null) return 0;
        return postRepo.findById(postId)
                .map(post -> voteRepo.countByPost(post))
                .orElse(0L);
    }

    @Override
    public boolean hasUserVoted(Integer userId, Long postId) {
        if (userId == null || postId == null) return false;
        return userRepo.findById(userId)
                .flatMap(user -> postRepo.findById(postId)
                        .map(post -> voteRepo.existsByUserAndPost(user, post)))
                .orElse(false);
    }

    // ─── Comment Vote ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CommentVoteResponse voteComment(CommentVoteRequest request) {
        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));
        Comment comment = commentRepo.findById(request.getCommentId())
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + request.getCommentId()));

        if (commentVoteRepo.existsByUserAndComment(user, comment)) {
            throw new RuntimeException("You already voted on this comment.");
        }

        CommentVote vote = new CommentVote();
        vote.setUser(user);
        vote.setComment(comment);
        vote.setCreatedAt(LocalDateTime.now());

        CommentVote saved = commentVoteRepo.save(vote);

        // Notify comment author about the vote
        User author = comment.getAuthor();
        if (!author.getUserId().equals(user.getUserId())) {
            notificationService.createAndSend(
                    author,
                    user.getName() + " liked your comment on: \"" + comment.getPost().getTitle() + "\"",
                    NotificationType.FORUM,
                    "/forum/post/" + comment.getPost().getPostId()
            );
        }

        // Broadcast updated vote count to everyone viewing this post
        long updatedCount = commentVoteRepo.countByComment(comment);
        messagingTemplate.convertAndSend(
                "/topic/post/" + comment.getPost().getPostId() + "/comment/" + comment.getCommentId() + "/votes",
                updatedCount
        );

        return CommentVoteResponse.builder()
                .voteId(saved.getVoteId())
                .userId(user.getUserId())
                .commentId(comment.getCommentId())
                .build();
    }

    @Override
    @Transactional
    public void unvoteComment(Integer userId, Long commentId) {
        if (userId == null || commentId == null) return;
        userRepo.findById(userId).ifPresent(user -> {
            commentRepo.findById(commentId).ifPresent(comment -> {
                commentVoteRepo.findByUserAndComment(user, comment).ifPresent(vote -> {
                    commentVoteRepo.delete(vote);

                    // Broadcast updated vote count
                    long updatedCount = commentVoteRepo.countByComment(comment);
                    messagingTemplate.convertAndSend(
                            "/topic/post/" + comment.getPost().getPostId() + "/comment/" + comment.getCommentId() + "/votes",
                            updatedCount
                    );
                });
            });
        });
    }

    @Override
    public List<Long> getUserVotedComments(Integer userId, Long postId) {
        if (userId == null || postId == null) return new java.util.ArrayList<>();
        Post post = postRepo.findById(postId).orElse(null);
        User user = userRepo.findById(userId).orElse(null);
        if (post == null || user == null) return new java.util.ArrayList<>();

        // Optional optimization: fetch comment votes by post directly.
        // For now, filter stream manually
        return commentVoteRepo.findAll().stream()
                .filter(v -> v.getUser().getUserId().equals(userId) && v.getComment().getPost().getPostId().equals(postId))
                .map(v -> v.getComment().getCommentId())
                .collect(Collectors.toList());
    }
}