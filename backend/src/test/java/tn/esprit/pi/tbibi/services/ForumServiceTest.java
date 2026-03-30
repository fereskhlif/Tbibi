package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.category.CategoryRequest;
import tn.esprit.pi.tbibi.DTO.category.CategoryResponse;
import tn.esprit.pi.tbibi.DTO.comment.CommentRequest;
import tn.esprit.pi.tbibi.DTO.comment.CommentResponse;
import tn.esprit.pi.tbibi.DTO.post.PostRequest;
import tn.esprit.pi.tbibi.DTO.post.PostResponse;
import tn.esprit.pi.tbibi.DTO.vote.VoteRequest;
import tn.esprit.pi.tbibi.DTO.vote.VoteResponse;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.mappers.*;
import tn.esprit.pi.tbibi.repositories.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ForumServiceTest {

    @Mock
    private CategoryRepository categoryRepo;
    @Mock
    private PostRepository postRepo;
    @Mock
    private CommentRepository commentRepo;
    @Mock
    private VoteRepository voteRepo;
    @Mock
    private UserRepo userRepo;
    @Mock
    private CategoryMapper categoryMapper;
    @Mock
    private PostMapper postMapper;
    @Mock
    private CommentMapper commentMapper;
    @Mock
    private VoteMapper voteMapper;
    @Mock
    private CloudinaryService cloudinaryService;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private CommentVoteRepository commentVoteRepo;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ForumService forumService;

    // Test data
    private User testUser;
    private Category testCategory;
    private Post testPost;
    private Comment testComment;
    private Vote testVote;

    @BeforeEach
    void setUp() {
        // Initialize test data
        testUser = User.builder()
                .userId(1)
                .name("John Doe")
                .email("john@test.com")
                .build();

        testCategory = Category.builder()
                .categoryId(1L)
                .categoryName("General Health")
                .categoryDescription("General health discussions")
                .createdAt(LocalDateTime.now())
                .active(true)
                .posts(new ArrayList<>())
                .build();

        testPost = Post.builder()
                .postId(1L)
                .title("Test Post")
                .content("Test content")
                .author(testUser)
                .category(testCategory)
                .createdDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .postStatus(PostStatus.OPEN)
                .views(0)
                .pinned(false)
                .deleted(false)
                .comments(new ArrayList<>())
                .mediaUrls(new ArrayList<>())
                .build();

        testComment = Comment.builder()
                .commentId(1L)
                .comment("Test comment")
                .author(testUser)
                .post(testPost)
                .commentDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .deleted(false)
                .build();

        testVote = Vote.builder()
                .voteId(1L)
                .user(testUser)
                .post(testPost)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CATEGORY TESTS
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    void testCreateCategory_Success() {
        // GIVEN
        CategoryRequest request = CategoryRequest.builder()
                .categoryName("New Category")
                .categoryDescription("Description")
                .build();

        Category savedCategory = Category.builder()
                .categoryId(1L)
                .categoryName(request.getCategoryName())
                .categoryDescription(request.getCategoryDescription())
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();

        CategoryResponse expectedResponse = CategoryResponse.builder()
                .categoryId(1L)
                .categoryName("New Category")
                .categoryDescription("Description")
                .active(true)
                .postCount(0)
                .build();

        when(categoryRepo.save(any(Category.class))).thenReturn(savedCategory);
        when(categoryMapper.toDto(any(Category.class))).thenReturn(expectedResponse);

        // WHEN
        CategoryResponse result = forumService.createCategory(request);

        // THEN
        assertNotNull(result);
        assertEquals("New Category", result.getCategoryName());
        assertEquals(0, result.getPostCount());
        assertTrue(result.getActive());
        verify(categoryRepo, times(1)).save(any(Category.class));
    }

    @Test
    void testGetAllCategories_Success() {
        // GIVEN
        List<Category> categories = Arrays.asList(testCategory);
        CategoryResponse categoryResponse = CategoryResponse.builder()
                .categoryId(1L)
                .categoryName("General Health")
                .postCount(0)
                .active(true)
                .build();

        when(categoryRepo.findByActiveTrue()).thenReturn(categories);
        when(categoryMapper.toDto(any(Category.class))).thenReturn(categoryResponse);

        // WHEN
        List<CategoryResponse> result = forumService.getAllCategories();

        // THEN
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("General Health", result.get(0).getCategoryName());
        verify(categoryRepo, times(1)).findByActiveTrue();
    }

    @Test
    void testUpdateCategory_Success() {
        // GIVEN
        Long categoryId = 1L;
        CategoryRequest request = CategoryRequest.builder()
                .categoryName("Updated Category")
                .categoryDescription("Updated description")
                .build();

        CategoryResponse expectedResponse = CategoryResponse.builder()
                .categoryId(categoryId)
                .categoryName("Updated Category")
                .categoryDescription("Updated description")
                .postCount(0)
                .build();

        when(categoryRepo.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepo.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toDto(any(Category.class))).thenReturn(expectedResponse);

        // WHEN
        CategoryResponse result = forumService.updateCategory(categoryId, request);

        // THEN
        assertNotNull(result);
        assertEquals("Updated Category", result.getCategoryName());
        verify(categoryRepo, times(1)).findById(categoryId);
        verify(categoryRepo, times(1)).save(any(Category.class));
    }

    @Test
    void testUpdateCategory_NotFound() {
        // GIVEN
        Long invalidId = 999L;
        CategoryRequest request = new CategoryRequest();
        when(categoryRepo.findById(invalidId)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            forumService.updateCategory(invalidId, request);
        });

        assertEquals("Category not found with id: 999", exception.getMessage());
        verify(categoryRepo, times(1)).findById(invalidId);
        verify(categoryRepo, never()).save(any());
    }

    @Test
    void testDeleteCategory_Success() {
        // GIVEN
        Long categoryId = 1L;
        when(categoryRepo.findById(categoryId)).thenReturn(Optional.of(testCategory));

        // WHEN
        forumService.deleteCategory(categoryId);

        // THEN
        assertFalse(testCategory.getActive()); // Should be set to false (soft delete)
        verify(categoryRepo, times(1)).findById(categoryId);
        verify(categoryRepo, times(1)).save(testCategory);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // POST TESTS
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    void testCreatePost_Success() {
        // GIVEN
        PostRequest request = PostRequest.builder()
                .title("New Post")
                .content("Post content")
                .authorId(1)
                .categoryId(1L)
                .build();

        PostResponse expectedResponse = PostResponse.builder()
                .postId(1L)
                .title("New Post")
                .content("Post content")
                .authorId(1)
                .categoryId(1L)
                .commentCount(0)
                .voteCount(0)
                .build();

        when(userRepo.findById(1)).thenReturn(Optional.of(testUser));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(testCategory));
        when(postRepo.save(any(Post.class))).thenReturn(testPost);
        when(postMapper.toDto(any(Post.class))).thenReturn(expectedResponse);

        // WHEN
        PostResponse result = forumService.createPost(request);

        // THEN
        assertNotNull(result);
        assertEquals("New Post", result.getTitle());
        assertEquals(0, result.getCommentCount());
        assertEquals(0, result.getVoteCount());
        verify(postRepo, times(1)).save(any(Post.class));
    }

    @Test
    void testCreatePost_AuthorNotFound() {
        // GIVEN
        PostRequest request = PostRequest.builder()
                .authorId(999)
                .categoryId(1L)
                .build();

        when(userRepo.findById(999)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            forumService.createPost(request);
        });

        assertEquals("Author not found with id: 999", exception.getMessage());
        verify(postRepo, never()).save(any());
    }

    @Test
    void testCreatePost_CategoryNotFound() {
        // GIVEN
        PostRequest request = PostRequest.builder()
                .authorId(1)
                .categoryId(999L)
                .build();

        when(userRepo.findById(1)).thenReturn(Optional.of(testUser));
        when(categoryRepo.findById(999L)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            forumService.createPost(request);
        });

        assertEquals("Category not found with id: 999", exception.getMessage());
        verify(postRepo, never()).save(any());
    }

    @Test
    void testGetPostById_Success() {
        // GIVEN
        Long postId = 1L;
        PostResponse expectedResponse = PostResponse.builder()
                .postId(postId)
                .title("Test Post")
                .views(1) // Should increment
                .build();

        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(postRepo.save(any(Post.class))).thenReturn(testPost);
        when(postMapper.toDto(any(Post.class))).thenReturn(expectedResponse);

        // WHEN
        PostResponse result = forumService.getPostById(postId);

        // THEN
        assertNotNull(result);
        assertEquals(1, testPost.getViews()); // View count should increment
        verify(postRepo, times(1)).findById(postId);
        verify(postRepo, times(1)).save(testPost); // Save to persist view count
    }

    @Test
    void testGetPostById_NotFound() {
        // GIVEN
        Long invalidId = 999L;
        when(postRepo.findById(invalidId)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            forumService.getPostById(invalidId);
        });

        assertEquals("Post not found with id: 999", exception.getMessage());
    }

    @Test
    void testGetAllPosts_Success() {
        // GIVEN
        List<Post> posts = Arrays.asList(testPost);
        PostResponse postResponse = PostResponse.builder()
                .postId(1L)
                .title("Test Post")
                .commentCount(0)
                .voteCount(0)
                .build();

        when(postRepo.findByDeletedFalseOrderByPinnedDescCreatedDateDesc()).thenReturn(posts);
        when(postMapper.toDto(any(Post.class))).thenReturn(postResponse);

        // WHEN
        List<PostResponse> result = forumService.getAllPosts();

        // THEN
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(postRepo, times(1)).findByDeletedFalseOrderByPinnedDescCreatedDateDesc();
    }

    @Test
    void testGetPostsByCategory_Success() {
        // GIVEN
        Long categoryId = 1L;
        List<Post> posts = Arrays.asList(testPost);
        PostResponse postResponse = PostResponse.builder().postId(1L).build();

        when(categoryRepo.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(postRepo.findByCategoryAndDeletedFalseOrderByPinnedDescCreatedDateDesc(testCategory))
                .thenReturn(posts);
        when(postMapper.toDto(any(Post.class))).thenReturn(postResponse);

        // WHEN
        List<PostResponse> result = forumService.getPostsByCategory(categoryId);

        // THEN
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(categoryRepo, times(1)).findById(categoryId);
    }

    @Test
    void testGetPostsByAuthor_Success() {
        // GIVEN
        Integer authorId = 1;
        List<Post> posts = Arrays.asList(testPost);
        PostResponse postResponse = PostResponse.builder().postId(1L).build();

        when(userRepo.findById(authorId)).thenReturn(Optional.of(testUser));
        when(postRepo.findByAuthorAndDeletedFalse(testUser)).thenReturn(posts);
        when(postMapper.toDto(any(Post.class))).thenReturn(postResponse);

        // WHEN
        List<PostResponse> result = forumService.getPostsByAuthor(authorId);

        // THEN
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userRepo, times(1)).findById(authorId);
    }

    @Test
    void testSearchPosts_Success() {
        // GIVEN
        String keyword = "health";
        List<Post> posts = Arrays.asList(testPost);
        PostResponse postResponse = PostResponse.builder().postId(1L).build();

        when(postRepo.findByTitleContainingIgnoreCaseAndDeletedFalse(keyword)).thenReturn(posts);
        when(postMapper.toDto(any(Post.class))).thenReturn(postResponse);

        // WHEN
        List<PostResponse> result = forumService.searchPosts(keyword);

        // THEN
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(postRepo, times(1)).findByTitleContainingIgnoreCaseAndDeletedFalse(keyword);
    }

    @Test
    void testUpdatePost_Success() {
        // GIVEN
        Long postId = 1L;
        PostRequest request = PostRequest.builder()
                .title("Updated Title")
                .content("Updated content")
                .build();

        PostResponse expectedResponse = PostResponse.builder()
                .postId(postId)
                .title("Updated Title")
                .content("Updated content")
                .build();

        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(postRepo.save(any(Post.class))).thenReturn(testPost);
        when(postMapper.toDto(any(Post.class))).thenReturn(expectedResponse);

        // WHEN
        PostResponse result = forumService.updatePost(postId, request);

        // THEN
        assertNotNull(result);
        assertEquals("Updated Title", result.getTitle());
        verify(postRepo, times(1)).save(testPost);
    }

    @Test
    void testUpdatePostStatus_Success() {
        // GIVEN
        Long postId = 1L;
        String status = "RESOLVED";
        PostResponse expectedResponse = PostResponse.builder()
                .postId(postId)
                .postStatus("RESOLVED")
                .build();

        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(postRepo.save(any(Post.class))).thenReturn(testPost);
        when(postMapper.toDto(any(Post.class))).thenReturn(expectedResponse);

        // WHEN
        PostResponse result = forumService.updatePostStatus(postId, status);

        // THEN
        assertNotNull(result);
        assertEquals(PostStatus.RESOLVED, testPost.getPostStatus());
        verify(postRepo, times(1)).save(testPost);
    }

    @Test
    void testTogglePin_PinPost() {
        // GIVEN
        Long postId = 1L;
        testPost.setPinned(false); // Start unpinned

        PostResponse expectedResponse = PostResponse.builder()
                .postId(postId)
                .isPinned(true)
                .build();

        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(postRepo.save(any(Post.class))).thenReturn(testPost);
        when(postMapper.toDto(any(Post.class))).thenReturn(expectedResponse);

        // WHEN
        PostResponse result = forumService.togglePin(postId);

        // THEN
        assertTrue(testPost.isPinned()); // Should now be pinned
        verify(postRepo, times(1)).save(testPost);
    }

    @Test
    void testTogglePin_UnpinPost() {
        // GIVEN
        Long postId = 1L;
        testPost.setPinned(true); // Start pinned

        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(postRepo.save(any(Post.class))).thenReturn(testPost);
        when(postMapper.toDto(any(Post.class))).thenReturn(PostResponse.builder().build());

        // WHEN
        forumService.togglePin(postId);

        // THEN
        assertFalse(testPost.isPinned()); // Should now be unpinned
    }

    @Test
    void testDeletePost_Success() {
        // GIVEN
        Long postId = 1L;
        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));

        // WHEN
        forumService.deletePost(postId);

        // THEN
        assertTrue(testPost.isDeleted()); // Soft delete
        verify(postRepo, times(1)).save(testPost);
    }

    @Test
    void testUploadPostMedia_Success() {
        // GIVEN
        Long postId = 1L;
        MultipartFile file1 = mock(MultipartFile.class);
        MultipartFile file2 = mock(MultipartFile.class);
        List<MultipartFile> files = Arrays.asList(file1, file2);
        List<String> uploadedUrls = Arrays.asList("url1.jpg", "url2.jpg");

        PostResponse expectedResponse = PostResponse.builder()
                .postId(postId)
                .mediaUrls(uploadedUrls)
                .build();

        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(cloudinaryService.uploadForumMediaFiles(files)).thenReturn(uploadedUrls);
        when(postRepo.save(any(Post.class))).thenReturn(testPost);
        when(postMapper.toDto(any(Post.class))).thenReturn(expectedResponse);

        // WHEN
        PostResponse result = forumService.uploadPostMedia(postId, files);

        // THEN
        assertNotNull(result);
        assertEquals(2, testPost.getMediaUrls().size());
        verify(cloudinaryService, times(1)).uploadForumMediaFiles(files);
        verify(postRepo, times(1)).save(testPost);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // COMMENT TESTS
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    void testAddComment_TopLevel_Success() {
        // GIVEN
        CommentRequest request = CommentRequest.builder()
                .comment("Great post!")
                .authorId(1)
                .postId(1L)
                .parentCommentId(null) // Top level
                .build();

        CommentResponse expectedResponse = CommentResponse.builder()
                .commentId(1L)
                .comment("Great post!")
                .authorId(1)
                .postId(1L)
                .replies(new ArrayList<>())
                .build();

        when(userRepo.findById(1)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(1L)).thenReturn(Optional.of(testPost));
        when(commentRepo.save(any(Comment.class))).thenReturn(testComment);
        when(commentMapper.toDto(any(Comment.class))).thenReturn(expectedResponse);
        when(commentRepo.findByParentCommentAndDeletedFalse(any())).thenReturn(new ArrayList<>());
        when(commentVoteRepo.countByComment(any())).thenReturn(0L);

        // WHEN
        CommentResponse result = forumService.addComment(request);

        // THEN
        assertNotNull(result);
        assertEquals("Great post!", result.getComment());
        assertNull(result.getParentCommentId());
        verify(commentRepo, times(1)).save(any(Comment.class));
    }

    @Test
    void testAddComment_Reply_Success() {
        // GIVEN
        Comment parentComment = Comment.builder()
                .commentId(1L)
                .comment("Original comment")
                .build();

        CommentRequest request = CommentRequest.builder()
                .comment("Reply to comment")
                .authorId(1)
                .postId(1L)
                .parentCommentId(1L) // This is a reply
                .build();

        CommentResponse expectedResponse = CommentResponse.builder()
                .commentId(2L)
                .comment("Reply to comment")
                .parentCommentId(1L)
                .build();

        when(userRepo.findById(1)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(1L)).thenReturn(Optional.of(testPost));
        when(commentRepo.findById(1L)).thenReturn(Optional.of(parentComment));
        when(commentRepo.save(any(Comment.class))).thenReturn(testComment);
        when(commentMapper.toDto(any(Comment.class))).thenReturn(expectedResponse);
        when(commentRepo.findByParentCommentAndDeletedFalse(any())).thenReturn(new ArrayList<>());
        when(commentVoteRepo.countByComment(any())).thenReturn(0L);

        // WHEN
        CommentResponse result = forumService.addComment(request);

        // THEN
        assertNotNull(result);
        assertEquals(1L, result.getParentCommentId());
        verify(commentRepo, times(1)).findById(1L); // Verify parent was fetched
    }

    @Test
    void testAddComment_AuthorNotFound() {
        // GIVEN
        CommentRequest request = CommentRequest.builder()
                .authorId(999)
                .postId(1L)
                .build();

        when(userRepo.findById(999)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            forumService.addComment(request);
        });

        assertEquals("Author not found with id: 999", exception.getMessage());
        verify(commentRepo, never()).save(any());
    }

    @Test
    void testAddComment_PostNotFound() {
        // GIVEN
        CommentRequest request = CommentRequest.builder()
                .authorId(1)
                .postId(999L)
                .build();

        when(userRepo.findById(1)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(999L)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            forumService.addComment(request);
        });

        assertEquals("Post not found with id: 999", exception.getMessage());
    }

    @Test
    void testGetCommentsByPost_Success() {
        // GIVEN
        Long postId = 1L;
        List<Comment> comments = Arrays.asList(testComment);
        CommentResponse commentResponse = CommentResponse.builder()
                .commentId(1L)
                .comment("Test comment")
                .replies(new ArrayList<>())
                .build();

        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(commentRepo.findByPostAndParentCommentIsNullAndDeletedFalse(testPost))
                .thenReturn(comments);
        when(commentMapper.toDto(any(Comment.class))).thenReturn(commentResponse);
        when(commentRepo.findByParentCommentAndDeletedFalse(any())).thenReturn(new ArrayList<>());
        when(commentVoteRepo.countByComment(any())).thenReturn(0L);

        // WHEN
        List<CommentResponse> result = forumService.getCommentsByPost(postId);

        // THEN
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(commentRepo, times(1)).findByPostAndParentCommentIsNullAndDeletedFalse(testPost);
    }

    @Test
    void testUpdateComment_Success() {
        // GIVEN
        Long commentId = 1L;
        String newComment = "Updated comment text";
        CommentResponse expectedResponse = CommentResponse.builder()
                .commentId(commentId)
                .comment(newComment)
                .build();

        when(commentRepo.findById(commentId)).thenReturn(Optional.of(testComment));
        when(commentRepo.save(any(Comment.class))).thenReturn(testComment);
        when(commentMapper.toDto(any(Comment.class))).thenReturn(expectedResponse);
        when(commentRepo.findByParentCommentAndDeletedFalse(any())).thenReturn(new ArrayList<>());
        when(commentVoteRepo.countByComment(any())).thenReturn(0L);

        // WHEN
        CommentResponse result = forumService.updateComment(commentId, newComment);

        // THEN
        assertNotNull(result);
        assertEquals(newComment, testComment.getComment());
        assertNotNull(testComment.getUpdatedDate());
        verify(commentRepo, times(1)).save(testComment);
    }

    @Test
    void testDeleteComment_Success() {
        // GIVEN
        Long commentId = 1L;
        when(commentRepo.findById(commentId)).thenReturn(Optional.of(testComment));

        // WHEN
        forumService.deleteComment(commentId);

        // THEN
        assertTrue(testComment.getDeleted()); // Soft delete
        verify(commentRepo, times(1)).save(testComment);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // VOTE TESTS
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    void testVotePost_Success() {
        // GIVEN
        VoteRequest request = VoteRequest.builder()
                .userId(1)
                .postId(1L)
                .build();

        VoteResponse expectedResponse = VoteResponse.builder()
                .voteId(1L)
                .userId(1)
                .postId(1L)
                .build();

        when(userRepo.findById(1)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(1L)).thenReturn(Optional.of(testPost));
        when(voteRepo.existsByUserAndPost(testUser, testPost)).thenReturn(false); // Not voted yet
        when(voteRepo.save(any(Vote.class))).thenReturn(testVote);
        when(voteMapper.toDto(any(Vote.class))).thenReturn(expectedResponse);
        when(voteRepo.countByPost(any())).thenReturn(1L);

        // WHEN
        VoteResponse result = forumService.votePost(request);

        // THEN
        assertNotNull(result);
        assertEquals(1L, result.getPostId());
        verify(voteRepo, times(1)).save(any(Vote.class));
    }

    @Test
    void testVotePost_AlreadyVoted() {
        // GIVEN
        VoteRequest request = VoteRequest.builder()
                .userId(1)
                .postId(1L)
                .build();

        when(userRepo.findById(1)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(1L)).thenReturn(Optional.of(testPost));
        when(voteRepo.existsByUserAndPost(testUser, testPost)).thenReturn(true); // Already voted

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            forumService.votePost(request);
        });

        assertEquals("You already voted on this post.", exception.getMessage());
        verify(voteRepo, never()).save(any());
    }

    @Test
    void testUnvotePost_Success() {
        // GIVEN
        Integer userId = 1;
        Long postId = 1L;

        when(userRepo.findById(userId)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(voteRepo.findByUserAndPost(testUser, testPost)).thenReturn(Optional.of(testVote));
        when(voteRepo.countByPost(any())).thenReturn(0L);

        // WHEN
        forumService.unvotePost(userId, postId);

        // THEN
        verify(voteRepo, times(1)).delete(testVote);
    }

    @Test
    void testUnvotePost_NoVoteFound() {
        // GIVEN
        Integer userId = 1;
        Long postId = 1L;

        when(userRepo.findById(userId)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(voteRepo.findByUserAndPost(testUser, testPost)).thenReturn(Optional.empty());

        // WHEN
        forumService.unvotePost(userId, postId);

        // THEN
        verify(voteRepo, never()).delete(any()); // Nothing to delete
    }

    @Test
    void testUnvotePost_NullParameters() {
        // WHEN
        forumService.unvotePost(null, 1L);
        forumService.unvotePost(1, null);

        // THEN
        verify(voteRepo, never()).delete(any());
    }

    @Test
    void testGetVoteCount_Success() {
        // GIVEN
        Long postId = 1L;
        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(voteRepo.countByPost(testPost)).thenReturn(5L);

        // WHEN
        long result = forumService.getVoteCount(postId);

        // THEN
        assertEquals(5L, result);
        verify(voteRepo, times(1)).countByPost(testPost);
    }

    @Test
    void testGetVoteCount_PostNotFound() {
        // GIVEN
        Long postId = 999L;
        when(postRepo.findById(postId)).thenReturn(Optional.empty());

        // WHEN
        long result = forumService.getVoteCount(postId);

        // THEN
        assertEquals(0L, result);
    }

    @Test
    void testGetVoteCount_NullPostId() {
        // WHEN
        long result = forumService.getVoteCount(null);

        // THEN
        assertEquals(0L, result);
        verify(postRepo, never()).findById(any());
    }

    @Test
    void testHasUserVoted_True() {
        // GIVEN
        Integer userId = 1;
        Long postId = 1L;

        when(userRepo.findById(userId)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(voteRepo.existsByUserAndPost(testUser, testPost)).thenReturn(true);

        // WHEN
        boolean result = forumService.hasUserVoted(userId, postId);

        // THEN
        assertTrue(result);
    }

    @Test
    void testHasUserVoted_False() {
        // GIVEN
        Integer userId = 1;
        Long postId = 1L;

        when(userRepo.findById(userId)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
        when(voteRepo.existsByUserAndPost(testUser, testPost)).thenReturn(false);

        // WHEN
        boolean result = forumService.hasUserVoted(userId, postId);

        // THEN
        assertFalse(result);
    }

    @Test
    void testHasUserVoted_NullParameters() {
        // WHEN & THEN
        assertFalse(forumService.hasUserVoted(null, 1L));
        assertFalse(forumService.hasUserVoted(1, null));
        verify(userRepo, never()).findById(any());
    }
}