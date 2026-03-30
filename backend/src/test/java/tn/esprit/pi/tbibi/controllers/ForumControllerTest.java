package tn.esprit.pi.tbibi.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.pi.tbibi.config.TestSecurityConfig;
import tn.esprit.pi.tbibi.DTO.category.CategoryRequest;
import tn.esprit.pi.tbibi.DTO.category.CategoryResponse;
import tn.esprit.pi.tbibi.DTO.comment.CommentRequest;
import tn.esprit.pi.tbibi.DTO.comment.CommentResponse;
import tn.esprit.pi.tbibi.DTO.post.PostRequest;
import tn.esprit.pi.tbibi.DTO.post.PostResponse;
import tn.esprit.pi.tbibi.DTO.vote.VoteRequest;
import tn.esprit.pi.tbibi.DTO.vote.VoteResponse;
import tn.esprit.pi.tbibi.services.IForumService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ForumController.class)
@Import(TestSecurityConfig.class)  // ⭐ THIS DISABLES SECURITY FOR TESTS
class ForumControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IForumService forumService;

    @Autowired
    private ObjectMapper objectMapper;

    private CategoryResponse categoryResponse;
    private PostResponse postResponse;
    private CommentResponse commentResponse;
    private VoteResponse voteResponse;

    @BeforeEach
    void setUp() {
        categoryResponse = CategoryResponse.builder()
                .categoryId(1L)
                .categoryName("General Health")
                .categoryDescription("General health discussions")
                .createdAt(LocalDateTime.now())
                .active(true)
                .postCount(5)
                .build();

        postResponse = PostResponse.builder()
                .postId(1L)
                .title("How to stay healthy?")
                .content("Looking for advice on staying healthy")
                .createdDate(LocalDateTime.now())
                .authorId(1)
                .authorName("John Doe")
                .categoryId(1L)
                .categoryName("General Health")
                .postStatus("OPEN")
                .views(10)
                .isPinned(false)
                .isDeleted(false)
                .commentCount(3)
                .voteCount(5)
                .build();

        commentResponse = CommentResponse.builder()
                .commentId(1L)
                .comment("Great question!")
                .authorId(2)
                .authorName("Jane Smith")
                .postId(1L)
                .commentDate(LocalDateTime.now())
                .isDeleted(false)
                .build();

        voteResponse = VoteResponse.builder()
                .voteId(1L)
                .userId(1)
                .userName("John Doe")
                .postId(1L)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CATEGORY ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    void testCreateCategory_Success() throws Exception {
        CategoryRequest request = CategoryRequest.builder()
                .categoryName("General Health")
                .categoryDescription("General health discussions")
                .build();

        when(forumService.createCategory(any(CategoryRequest.class)))
                .thenReturn(categoryResponse);

        mockMvc.perform(post("/api/forum/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryId").value(1))
                .andExpect(jsonPath("$.categoryName").value("General Health"))
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.postCount").value(5));

        verify(forumService, times(1)).createCategory(any(CategoryRequest.class));
    }

    @Test
    void testGetAllCategories_Success() throws Exception {
        List<CategoryResponse> categories = Arrays.asList(categoryResponse);
        when(forumService.getAllCategories()).thenReturn(categories);

        mockMvc.perform(get("/api/forum/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].categoryId").value(1))
                .andExpect(jsonPath("$[0].categoryName").value("General Health"));

        verify(forumService, times(1)).getAllCategories();
    }

    @Test
    void testUpdateCategory_Success() throws Exception {
        Long categoryId = 1L;
        CategoryRequest request = CategoryRequest.builder()
                .categoryName("Updated Category")
                .categoryDescription("Updated description")
                .build();

        CategoryResponse updatedResponse = CategoryResponse.builder()
                .categoryId(categoryId)
                .categoryName("Updated Category")
                .categoryDescription("Updated description")
                .build();

        when(forumService.updateCategory(eq(categoryId), any(CategoryRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/forum/categories/{id}", categoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryName").value("Updated Category"));

        verify(forumService, times(1)).updateCategory(eq(categoryId), any(CategoryRequest.class));
    }

    @Test
    void testDeleteCategory_Success() throws Exception {
        Long categoryId = 1L;
        doNothing().when(forumService).deleteCategory(categoryId);

        mockMvc.perform(delete("/api/forum/categories/{id}", categoryId))
                .andExpect(status().isOk());

        verify(forumService, times(1)).deleteCategory(categoryId);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // POST ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    void testCreatePost_Success() throws Exception {
        PostRequest request = PostRequest.builder()
                .title("How to stay healthy?")
                .content("Looking for advice")
                .authorId(1)
                .categoryId(1L)
                .build();

        when(forumService.createPost(any(PostRequest.class))).thenReturn(postResponse);

        mockMvc.perform(post("/api/forum/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.postId").value(1))
                .andExpect(jsonPath("$.title").value("How to stay healthy?"))
                .andExpect(jsonPath("$.authorId").value(1))
                .andExpect(jsonPath("$.categoryId").value(1));

        verify(forumService, times(1)).createPost(any(PostRequest.class));
    }

    @Test
    void testGetAllPosts_Success() throws Exception {
        List<PostResponse> posts = Arrays.asList(postResponse);
        when(forumService.getAllPosts()).thenReturn(posts);

        mockMvc.perform(get("/api/forum/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].postId").value(1))
                .andExpect(jsonPath("$[0].title").value("How to stay healthy?"));

        verify(forumService, times(1)).getAllPosts();
    }

    @Test
    void testGetPostById_Success() throws Exception {
        Long postId = 1L;
        when(forumService.getPostById(postId)).thenReturn(postResponse);

        mockMvc.perform(get("/api/forum/posts/{id}", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.postId").value(1))
                .andExpect(jsonPath("$.title").value("How to stay healthy?"))
                .andExpect(jsonPath("$.views").value(10));

        verify(forumService, times(1)).getPostById(postId);
    }

    @Test
    void testGetPostsByCategory_Success() throws Exception {
        Long categoryId = 1L;
        List<PostResponse> posts = Arrays.asList(postResponse);
        when(forumService.getPostsByCategory(categoryId)).thenReturn(posts);

        mockMvc.perform(get("/api/forum/posts/category/{categoryId}", categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].categoryId").value(1));

        verify(forumService, times(1)).getPostsByCategory(categoryId);
    }

    @Test
    void testGetPostsByAuthor_Success() throws Exception {
        Integer authorId = 1;
        List<PostResponse> posts = Arrays.asList(postResponse);
        when(forumService.getPostsByAuthor(authorId)).thenReturn(posts);

        mockMvc.perform(get("/api/forum/posts/author/{authorId}", authorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].authorId").value(1));

        verify(forumService, times(1)).getPostsByAuthor(authorId);
    }

    @Test
    void testSearchPosts_Success() throws Exception {
        String keyword = "health";
        List<PostResponse> posts = Arrays.asList(postResponse);
        when(forumService.searchPosts(keyword)).thenReturn(posts);

        mockMvc.perform(get("/api/forum/posts/search")
                        .param("keyword", keyword))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("How to stay healthy?"));

        verify(forumService, times(1)).searchPosts(keyword);
    }

    @Test
    void testUpdatePost_Success() throws Exception {
        Long postId = 1L;
        PostRequest request = PostRequest.builder()
                .title("Updated Title")
                .content("Updated content")
                .authorId(1)
                .categoryId(1L)
                .build();

        PostResponse updatedResponse = PostResponse.builder()
                .postId(postId)
                .title("Updated Title")
                .content("Updated content")
                .build();

        when(forumService.updatePost(eq(postId), any(PostRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/forum/posts/{id}", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));

        verify(forumService, times(1)).updatePost(eq(postId), any(PostRequest.class));
    }

    @Test
    void testUpdatePostStatus_Success() throws Exception {
        Long postId = 1L;
        String status = "RESOLVED";

        PostResponse updatedResponse = PostResponse.builder()
                .postId(postId)
                .postStatus("RESOLVED")
                .build();

        when(forumService.updatePostStatus(postId, status)).thenReturn(updatedResponse);

        mockMvc.perform(put("/api/forum/posts/{id}/status", postId)
                        .param("status", status))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.postStatus").value("RESOLVED"));

        verify(forumService, times(1)).updatePostStatus(postId, status);
    }

    @Test
    void testTogglePin_Success() throws Exception {
        Long postId = 1L;
        PostResponse pinnedResponse = PostResponse.builder()
                .postId(postId)
                .isPinned(true)
                .build();

        when(forumService.togglePin(postId)).thenReturn(pinnedResponse);

        mockMvc.perform(put("/api/forum/posts/{id}/pin", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isPinned").value(true));

        verify(forumService, times(1)).togglePin(postId);
    }

    @Test
    void testDeletePost_Success() throws Exception {
        Long postId = 1L;
        doNothing().when(forumService).deletePost(postId);

        mockMvc.perform(delete("/api/forum/posts/{id}", postId))
                .andExpect(status().isOk());

        verify(forumService, times(1)).deletePost(postId);
    }

    @Test
    void testUploadPostMedia_Success() throws Exception {
        Long postId = 1L;
        MockMultipartFile file1 = new MockMultipartFile(
                "files",
                "image1.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "image content".getBytes()
        );

        PostResponse responseWithMedia = PostResponse.builder()
                .postId(postId)
                .mediaUrls(Arrays.asList("url1.jpg"))
                .build();

        when(forumService.uploadPostMedia(eq(postId), anyList()))
                .thenReturn(responseWithMedia);

        mockMvc.perform(multipart("/api/forum/posts/{id}/media", postId)
                        .file(file1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.postId").value(postId))
                .andExpect(jsonPath("$.mediaUrls").isArray());

        verify(forumService, times(1)).uploadPostMedia(eq(postId), anyList());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // COMMENT ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    void testAddComment_Success() throws Exception {
        CommentRequest request = CommentRequest.builder()
                .comment("Great question!")
                .authorId(2)
                .postId(1L)
                .build();

        when(forumService.addComment(any(CommentRequest.class)))
                .thenReturn(commentResponse);

        mockMvc.perform(post("/api/forum/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.commentId").value(1))
                .andExpect(jsonPath("$.comment").value("Great question!"))
                .andExpect(jsonPath("$.authorId").value(2));

        verify(forumService, times(1)).addComment(any(CommentRequest.class));
    }

    @Test
    void testGetCommentsByPost_Success() throws Exception {
        Long postId = 1L;
        List<CommentResponse> comments = Arrays.asList(commentResponse);
        when(forumService.getCommentsByPost(postId)).thenReturn(comments);

        mockMvc.perform(get("/api/forum/comments/post/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].commentId").value(1))
                .andExpect(jsonPath("$[0].postId").value(1));

        verify(forumService, times(1)).getCommentsByPost(postId);
    }

    @Test
    void testUpdateComment_Success() throws Exception {
        Long commentId = 1L;
        String newComment = "Updated comment";

        CommentResponse updatedResponse = CommentResponse.builder()
                .commentId(commentId)
                .comment(newComment)
                .build();

        when(forumService.updateComment(commentId, newComment))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/forum/comments/{id}", commentId)
                        .param("comment", newComment))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comment").value(newComment));

        verify(forumService, times(1)).updateComment(commentId, newComment);
    }

    @Test
    void testDeleteComment_Success() throws Exception {
        Long commentId = 1L;
        doNothing().when(forumService).deleteComment(commentId);

        mockMvc.perform(delete("/api/forum/comments/{id}", commentId))
                .andExpect(status().isOk());

        verify(forumService, times(1)).deleteComment(commentId);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // VOTE ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    void testVotePost_Success() throws Exception {
        VoteRequest request = VoteRequest.builder()
                .userId(1)
                .postId(1L)
                .build();

        when(forumService.votePost(any(VoteRequest.class))).thenReturn(voteResponse);

        mockMvc.perform(post("/api/forum/votes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voteId").value(1))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.postId").value(1));

        verify(forumService, times(1)).votePost(any(VoteRequest.class));
    }

    @Test
    void testUnvotePost_Success() throws Exception {
        Integer userId = 1;
        Long postId = 1L;
        doNothing().when(forumService).unvotePost(userId, postId);

        mockMvc.perform(delete("/api/forum/votes")
                        .param("userId", userId.toString())
                        .param("postId", postId.toString()))
                .andExpect(status().isOk());

        verify(forumService, times(1)).unvotePost(userId, postId);
    }

    @Test
    void testGetVoteCount_Success() throws Exception {
        Long postId = 1L;
        when(forumService.getVoteCount(postId)).thenReturn(10L);

        mockMvc.perform(get("/api/forum/votes/count/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(content().string("10"));

        verify(forumService, times(1)).getVoteCount(postId);
    }

    @Test
    void testHasUserVoted_True() throws Exception {
        Integer userId = 1;
        Long postId = 1L;
        when(forumService.hasUserVoted(userId, postId)).thenReturn(true);

        mockMvc.perform(get("/api/forum/votes/check")
                        .param("userId", userId.toString())
                        .param("postId", postId.toString()))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));

        verify(forumService, times(1)).hasUserVoted(userId, postId);
    }

    @Test
    void testHasUserVoted_False() throws Exception {
        Integer userId = 1;
        Long postId = 1L;
        when(forumService.hasUserVoted(userId, postId)).thenReturn(false);

        mockMvc.perform(get("/api/forum/votes/check")
                        .param("userId", userId.toString())
                        .param("postId", postId.toString()))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));

        verify(forumService, times(1)).hasUserVoted(userId, postId);
    }
}