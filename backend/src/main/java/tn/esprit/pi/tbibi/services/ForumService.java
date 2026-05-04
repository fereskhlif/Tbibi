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
import tn.esprit.pi.tbibi.DTO.relatedpost.RelatedPostDTO;
import tn.esprit.pi.tbibi.DTO.vote.*;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.exception.BusinessException;
import tn.esprit.pi.tbibi.mappers.*;
import tn.esprit.pi.tbibi.repositories.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.scheduling.annotation.Async;

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

    @Autowired // ✅ ADDED
    AiModerationService aiModerationService;

    @Autowired
    PostViewRepository postViewRepo;

    @Autowired
    GroqService groqService;

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

    @Override
    @Transactional
    public PostResponse uploadPostMedia(Long postId, List<MultipartFile> files) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        List<String> urls = cloudinaryService.uploadForumMediaFiles(files);
        if (post.getMediaUrls() == null)
            post.setMediaUrls(new ArrayList<>());
        post.getMediaUrls().addAll(urls);
        return mapPostWithCounts(postRepo.save(post));
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
    public Page<PostResponse> getAllPostsPaginated(List<Long> categoryIds, String status, Pageable pageable) {
        PostStatus postStatus = null;
        if (status != null && !status.equalsIgnoreCase("all")) {
            try {
                postStatus = PostStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
            }
        }

        if (categoryIds != null && !categoryIds.isEmpty()) {
            if (postStatus != null) {
                return postRepo
                        .findByCategoryCategoryIdInAndPostStatusAndDeletedFalse(categoryIds, postStatus, pageable)
                        .map(this::mapPostWithCounts);
            }
            return postRepo.findByCategoryCategoryIdInAndDeletedFalse(categoryIds, pageable)
                    .map(this::mapPostWithCounts);
        }

        if (postStatus != null) {
            return postRepo.findByPostStatusAndDeletedFalse(postStatus, pageable)
                    .map(this::mapPostWithCounts);
        }
        return postRepo.findByDeletedFalse(pageable).map(this::mapPostWithCounts);
    }

    @Override
    @Transactional
    public PostResponse createPost(PostRequest request) {
        User author = userRepo.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + request.getAuthorId()));
        Category category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        // ✅ SANITIZE title and content before saving
        AiModerationService.SanitizeResponse titleResult = aiModerationService.sanitizeAndScore(request.getTitle());
        AiModerationService.SanitizeResponse contentResult = aiModerationService.sanitizeAndScore(request.getContent());

        Post post = new Post();
        post.setTitle(titleResult.getCleaned()); // ✅ cleaned
        post.setContent(contentResult.getCleaned()); // ✅ cleaned
        post.setMediaUrls(new ArrayList<>());
        post.setAuthor(author);
        post.setCategory(category);
        post.setCreatedDate(LocalDateTime.now());
        post.setUpdatedDate(LocalDateTime.now());
        post.setPostStatus(PostStatus.OPEN);
        post.setViews(0);
        post.setPinned(false);
        post.setDeleted(false);

        // ✅ SET Toxicity directly from sanitize result
        double maxProb = Math.max(titleResult.getConfidence(), contentResult.getConfidence());
        if (maxProb >= 0) {
            post.setToxicityScore(maxProb);
            if (maxProb >= 0.75)
                post.setToxicityVerdict("TOXIC");
            else if (maxProb >= 0.40)
                post.setToxicityVerdict("UNCERTAIN");
            else
                post.setToxicityVerdict("CLEAN");
            post.setToxicitySource("PYTHON_API");
            post.setToxicityScoredAt(LocalDateTime.now());
        }

        Post saved = postRepo.save(post);

        // ─── Notify professionals based on category ───────────────────────
        String categoryName = category.getCategoryName();
        String roleToNotify = null;
        if (categoryName.equals("Ask a Doctor"))
            roleToNotify = "DOCTOR";
        else if (categoryName.equals("Ask a Pharmacist"))
            roleToNotify = "PHARMACIST";
        else if (categoryName.equals("Ask a Lab"))
            roleToNotify = "LABORATORY";
        else if (categoryName.equals("Ask a Physiotherapist"))
            roleToNotify = "PHYSIOTHERAPIST";

        if (roleToNotify != null) {
            notificationService.notifyAllByRole(
                    roleToNotify,
                    author.getName() + " posted a question: \"" + saved.getTitle() + "\"",
                    NotificationType.FORUM,
                    "/forum/post/" + saved.getPostId());
        }

        return mapPostWithCounts(saved);
    }

    @Override
    @Transactional
    public PostResponse getPostById(Long id, Integer userId) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

        // Only increment views if userId is provided and this user hasn't viewed before
        if (userId != null && userId > 0) {
            if (!postViewRepo.existsByPostPostIdAndUserId(id, userId)) {
                PostView view = PostView.builder()
                        .post(post)
                        .userId(userId)
                        .build();
                postViewRepo.save(view);
                post.setViews(post.getViews() + 1);
                postRepo.save(post);
            }
        }

        return mapPostWithCounts(post);
    }

    @Override
    @Transactional
    public List<PostResponse> getPostsByCategory(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        return postRepo.findByCategoryAndDeletedFalseOrderByPinnedDescCreatedDateDesc(category)
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
            }
        }
        return postRepo.findByCategoryAndDeletedFalse(category, pageable).map(this::mapPostWithCounts);
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
    public Page<PostResponse> searchPostsPaginated(String keyword, List<Long> categoryIds, String status,
            Pageable pageable) {
        PostStatus postStatus = null;
        if (status != null && !status.equalsIgnoreCase("all")) {
            try {
                postStatus = PostStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
            }
        }

        if (categoryIds != null && !categoryIds.isEmpty()) {
            if (postStatus != null) {
                return postRepo
                        .findByTitleContainingIgnoreCaseAndCategoryCategoryIdInAndPostStatusAndDeletedFalse(keyword,
                                categoryIds, postStatus, pageable)
                        .map(this::mapPostWithCounts);
            }
            return postRepo
                    .findByTitleContainingIgnoreCaseAndCategoryCategoryIdInAndDeletedFalse(keyword, categoryIds,
                            pageable)
                    .map(this::mapPostWithCounts);
        }

        if (postStatus != null) {
            return postRepo.findByTitleContainingIgnoreCaseAndPostStatusAndDeletedFalse(keyword, postStatus, pageable)
                    .map(this::mapPostWithCounts);
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

        // ✅ SANITIZE comment before saving
        AiModerationService.SanitizeResponse sanitizeResult = aiModerationService
                .sanitizeAndScore(request.getComment());

        Comment comment = new Comment();
        comment.setComment(sanitizeResult.getCleaned()); // ✅ cleaned
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setCommentDate(LocalDateTime.now());
        comment.setUpdatedDate(LocalDateTime.now());
        comment.setDeleted(false);

        if (request.getParentCommentId() != null) {
            Comment parent = commentRepo.findById(request.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException(
                            "Parent comment not found with id: " + request.getParentCommentId()));
            comment.setParentComment(parent);
        }

        // ✅ SET Toxicity directly from sanitize result
        double prob = sanitizeResult.getConfidence();
        if (prob >= 0) {
            comment.setToxicityScore(prob);
            if (prob >= 0.75)
                comment.setToxicityVerdict("TOXIC");
            else if (prob >= 0.40)
                comment.setToxicityVerdict("UNCERTAIN");
            else
                comment.setToxicityVerdict("CLEAN");
            comment.setToxicitySource("PYTHON_API");
            comment.setToxicityScoredAt(LocalDateTime.now());
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
                    "/forum/post/" + commentPost.getPostId());
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
                        "/forum/post/" + commentPost.getPostId());
            }
        }

        // ─── Broadcast to everyone viewing this post ──────────────────────
        CommentResponse response = mapCommentWithReplies(savedComment);
        messagingTemplate.convertAndSend(
                "/topic/post/" + post.getPostId() + "/comments", response);

        return response;
    }

    @Override
    @Transactional
    public List<CommentResponse> getCommentsByPost(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        return commentRepo.findByPostOrderByExpertFirst(post)
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
        if (!comment.getPost().getAuthor().getUserId().equals(currentUserId))
            throw new BusinessException("Only the post author can pin comments");
        if (comment.getParentComment() != null)
            throw new BusinessException("Only parent comments can be pinned");
        if (!comment.isPinned()) {
            long pinnedCount = commentRepo.countByPostAndPinnedTrueAndDeletedFalse(comment.getPost());
            if (pinnedCount >= 3)
                throw new BusinessException(
                        "Maximum 3 pinned comments reached. Please unpin an existing comment first.");
            comment.setPinned(true);
        } else {
            comment.setPinned(false);
        }
        return mapCommentWithReplies(commentRepo.save(comment));
    }

    // ─── Vote ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VoteResponse votePost(VoteRequest request) {
        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));
        Post post = postRepo.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + request.getPostId()));
        if (voteRepo.existsByUserAndPost(user, post))
            throw new RuntimeException("You already voted on this post.");
        Vote vote = new Vote();
        vote.setUser(user);
        vote.setPost(post);
        vote.setCreatedAt(LocalDateTime.now());
        VoteResponse response = voteMapper.toDto(voteRepo.save(vote));
        User postAuthor = post.getAuthor();
        if (!postAuthor.getUserId().equals(user.getUserId())) {
            notificationService.createAndSend(
                    postAuthor,
                    user.getName() + " voted on your post: \"" + post.getTitle() + "\"",
                    NotificationType.FORUM,
                    "/forum/post/" + post.getPostId());
        }
        long updatedCount = voteRepo.countByPost(post);
        messagingTemplate.convertAndSend("/topic/post/" + post.getPostId() + "/votes", updatedCount);
        return response;
    }

    @Override
    @Transactional
    public void unvotePost(Integer userId, Long postId) {
        if (userId == null || postId == null)
            return;
        userRepo.findById(userId).ifPresent(user -> postRepo.findById(postId)
                .ifPresent(post -> voteRepo.findByUserAndPost(user, post).ifPresent(vote -> {
                    voteRepo.delete(vote);
                    long updatedCount = voteRepo.countByPost(post);
                    messagingTemplate.convertAndSend("/topic/post/" + post.getPostId() + "/votes", updatedCount);
                })));
    }

    @Override
    public long getVoteCount(Long postId) {
        if (postId == null)
            return 0;
        return postRepo.findById(postId).map(post -> voteRepo.countByPost(post)).orElse(0L);
    }

    @Override
    public boolean hasUserVoted(Integer userId, Long postId) {
        if (userId == null || postId == null)
            return false;
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
        if (commentVoteRepo.existsByUserAndComment(user, comment))
            throw new RuntimeException("You already voted on this comment.");
        CommentVote vote = new CommentVote();
        vote.setUser(user);
        vote.setComment(comment);
        vote.setCreatedAt(LocalDateTime.now());
        CommentVote saved = commentVoteRepo.save(vote);
        User author = comment.getAuthor();
        if (!author.getUserId().equals(user.getUserId())) {
            notificationService.createAndSend(
                    author,
                    user.getName() + " liked your comment on: \"" + comment.getPost().getTitle() + "\"",
                    NotificationType.FORUM,
                    "/forum/post/" + comment.getPost().getPostId());
        }
        long updatedCount = commentVoteRepo.countByComment(comment);
        messagingTemplate.convertAndSend(
                "/topic/post/" + comment.getPost().getPostId() + "/comment/" + comment.getCommentId() + "/votes",
                updatedCount);
        return CommentVoteResponse.builder()
                .voteId(saved.getVoteId())
                .userId(user.getUserId())
                .commentId(comment.getCommentId())
                .build();
    }

    @Override
    @Transactional
    public void unvoteComment(Integer userId, Long commentId) {
        if (userId == null || commentId == null)
            return;
        userRepo.findById(userId).ifPresent(user -> commentRepo.findById(commentId)
                .ifPresent(comment -> commentVoteRepo.findByUserAndComment(user, comment).ifPresent(vote -> {
                    commentVoteRepo.delete(vote);
                    long updatedCount = commentVoteRepo.countByComment(comment);
                    messagingTemplate.convertAndSend(
                            "/topic/post/" + comment.getPost().getPostId() + "/comment/" + comment.getCommentId()
                                    + "/votes",
                            updatedCount);
                })));
    }

    @Override
    public List<Long> getUserVotedComments(Integer userId, Long postId) {
        if (userId == null || postId == null)
            return new java.util.ArrayList<>();
        Post post = postRepo.findById(postId).orElse(null);
        User user = userRepo.findById(userId).orElse(null);
        if (post == null || user == null)
            return new java.util.ArrayList<>();
        return commentVoteRepo.findAll().stream()
                .filter(v -> v.getUser().getUserId().equals(userId)
                        && v.getComment().getPost().getPostId().equals(postId))
                .map(v -> v.getComment().getCommentId())
                .collect(Collectors.toList());
    }

    // ─── Stop words to filter out ───────────────────────────────────────────────
    private String toRoot(String keyword) {
        if (keyword.equals("___NOMATCH___"))
            return keyword;
        return keyword.length() > 5 ? keyword.substring(0, 5) : keyword;
    }

    private static final Set<String> STOP_WORDS = Set.of(
            // common english
            "the", "and", "for", "that", "this", "with", "have", "from", "they",
            "will", "been", "what", "when", "your", "about", "after", "before",
            "just", "like", "also", "some", "more", "than", "then", "into", "over",
            // health forum noise (appear in every post → useless for matching)
            "doctor", "help", "please", "anyone", "know", "need", "feel", "pain",
            "problem", "question", "advice", "hello", "thanks", "thank", "good",
            "bad", "very", "really", "much", "want", "does", "here", "there", "why",
            "how", "which", "where", "would", "could", "should", "cannot", "dont",
            "iam", "has", "had", "was", "were", "did", "can", "get", "got",
            "its", "not", "but", "are", "our", "any", "all", "one", "two", "three");

    // ─── Extract 3 keywords from title + first 50 words of content ──────────────
    private List<String> extractKeywords(Post post) {

        String title = post.getTitle() != null ? post.getTitle().toLowerCase() : "";

        String contentPreview = "";
        if (post.getContent() != null) {
            contentPreview = Arrays.stream(post.getContent().toLowerCase().split("\\s+"))
                    .limit(50)
                    .collect(Collectors.joining(" "));
        }

        String combined = title + " " + contentPreview;

        List<String> keywords = Arrays.stream(combined.split("[^a-zA-Z]+"))
                .filter(w -> w.length() > 3) // ignore short words
                .filter(w -> !STOP_WORDS.contains(w)) // ignore noise words
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        // Always pad to 3 so the query never breaks
        while (keywords.size() < 5) {
            keywords.add("___NOMATCH___");
        }

        return keywords;
    }

    // ─── Main method ────────────────────────────────────────────────────────────
    public List<RelatedPostDTO> getRelatedPosts(Long postId) {

        Post current = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (current.getCategory() == null) {
            return Collections.emptyList();
        }

        List<String> keywords = extractKeywords(current);

        List<Object[]> results = postRepo.findRelatedPosts(
                current.getCategory().getCategoryId(),
                postId,
                toRoot(keywords.get(0)),
                toRoot(keywords.get(1)),
                toRoot(keywords.get(2)),
                toRoot(keywords.get(3)),
                toRoot(keywords.get(4)));

        return results.stream()
                .map(row -> {
                    Post p = (Post) row[0];
                    int score = ((Number) row[1]).intValue();
                    return RelatedPostDTO.builder()
                            .postId(p.getPostId())
                            .title(p.getTitle())
                            .authorName(p.getAuthor() != null ? p.getAuthor().getName() : "Unknown")
                            .categoryName(p.getCategory() != null ? p.getCategory().getCategoryName() : "")
                            .voteCount(p.getVoteCount())
                            .commentCount(p.getCommentCount())
                            .views(p.getViews())
                            .postStatus(p.getPostStatus())
                            .createdDate(p.getCreatedDate())
                            .relevanceScore(score)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String getThreadSummary(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<Comment> comments = commentRepo.findByPostOrderByExpertFirst(post);

        StringBuilder sb = new StringBuilder();
        sb.append("POST TITLE: ").append(post.getTitle()).append("\n");
        sb.append("POST CONTENT: ").append(post.getContent()).append("\n\n");
        sb.append("DISCUSSION:\n");

        for (Comment c : comments) {
            String role = (c.getAuthor() != null && c.getAuthor().getRole() != null)
                    ? c.getAuthor().getRole().getRoleName()
                    : "PATIENT";
            sb.append("- [").append(role).append("] ").append(c.getAuthor().getName())
                    .append(": ").append(c.getComment()).append("\n");
        }

        String systemPrompt = "You are a medical discussion summarizer. Your goal is to provide a concise, high-level summary of a healthcare forum thread. "
                +
                "Focus on the professional advice given by experts (Doctors, Pharmacists, etc.) and the final consensus or next steps for the patient. "
                +
                "Format the summary in 3-4 bullet points using Markdown. Keep it professional and empathetic.";

        try {
            return groqService.generateChatCompletion(systemPrompt, sb.toString());
        } catch (Exception e) {
            return "Unable to generate summary: " + e.getMessage();
        }
    }

    @Override
    @Transactional
    public reactor.core.publisher.Flux<String> getThreadSummaryStream(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<Comment> comments = commentRepo.findByPostOrderByExpertFirst(post);

        StringBuilder sb = new StringBuilder();
        sb.append("POST TITLE: ").append(post.getTitle()).append("\n");
        sb.append("POST CONTENT: ").append(post.getContent()).append("\n\n");
        sb.append("DISCUSSION:\n");

        for (Comment c : comments) {
            String role = (c.getAuthor() != null && c.getAuthor().getRole() != null)
                    ? c.getAuthor().getRole().getRoleName()
                    : "PATIENT";
            sb.append("- [").append(role).append("] ").append(c.getAuthor().getName())
                    .append(": ").append(c.getComment()).append("\n");
        }

        String systemPrompt = "You are a medical discussion summarizer. Your goal is to provide a concise, high-level summary of a healthcare forum thread. "
                +
                "Focus on the professional advice given by experts (Doctors, Pharmacists, etc.) and the final consensus or next steps for the patient. "
                +
                "Format the summary in 3-4 bullet points using Markdown. Keep it professional and empathetic.";

        System.out
                .println("AI Summary: Sending request to Groq API... (Prompt length: " + sb.toString().length() + ")");
        return groqService.streamChatCompletion(systemPrompt, sb.toString());
    }
}