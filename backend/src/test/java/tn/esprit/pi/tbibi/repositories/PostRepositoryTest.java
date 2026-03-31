package tn.esprit.pi.tbibi.repositories;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import tn.esprit.pi.tbibi.entities.*;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PostRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PostRepository postRepository;

    private User testUser;
    private Category testCategory;
    private Post pinnedPost;
    private Post normalPost;
    private Post deletedPost;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = User.builder()
                .name("John Doe")
                .email("john@test.com")
                .build();
        entityManager.persist(testUser);

        // Create test category
        testCategory = Category.builder()
                .categoryName("Health")
                .categoryDescription("Health topics")
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();
        entityManager.persist(testCategory);

        // Create pinned post
        pinnedPost = Post.builder()
                .title("Pinned Post")
                .content("Important announcement")
                .author(testUser)
                .category(testCategory)
                .createdDate(LocalDateTime.now().minusDays(2))
                .updatedDate(LocalDateTime.now())
                .postStatus(PostStatus.OPEN)
                .views(0)
                .pinned(true)  // ← Pinned
                .deleted(false)
                .build();
        entityManager.persist(pinnedPost);

        // Create normal post
        normalPost = Post.builder()
                .title("Normal Post")
                .content("Regular content")
                .author(testUser)
                .category(testCategory)
                .createdDate(LocalDateTime.now().minusDays(1))
                .updatedDate(LocalDateTime.now())
                .postStatus(PostStatus.OPEN)
                .views(0)
                .pinned(false)
                .deleted(false)
                .build();
        entityManager.persist(normalPost);

        // Create deleted post
        deletedPost = Post.builder()
                .title("Deleted Post")
                .content("This is deleted")
                .author(testUser)
                .category(testCategory)
                .createdDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .postStatus(PostStatus.OPEN)
                .views(0)
                .pinned(false)
                .deleted(true)  // ← Deleted
                .build();
        entityManager.persist(deletedPost);

        entityManager.flush();
    }

    @Test
    void testFindByDeletedFalseOrderByPinnedDescCreatedDateDesc_ShouldReturnPinnedFirst() {
        // WHEN
        List<Post> result = postRepository.findByDeletedFalseOrderByPinnedDescCreatedDateDesc();

        // THEN
        assertEquals(2, result.size());  // Should exclude deleted post
        assertTrue(result.get(0).isPinned());  // First should be pinned
        assertEquals("Pinned Post", result.get(0).getTitle());
        assertFalse(result.get(1).isPinned());  // Second should be normal
    }

    @Test
    void testFindByCategoryAndDeletedFalse_ShouldReturnOnlyNonDeletedFromCategory() {
        // WHEN
        List<Post> result = postRepository.findByCategoryAndDeletedFalseOrderByPinnedDescCreatedDateDesc(testCategory);

        // THEN
        assertEquals(2, result.size());  // 2 non-deleted posts in this category
        result.forEach(post -> {
            assertEquals(testCategory.getCategoryId(), post.getCategory().getCategoryId());
            assertFalse(post.isDeleted());
        });
    }

    @Test
    void testFindByAuthorAndDeletedFalse_ShouldReturnUserPosts() {
        // WHEN
        List<Post> result = postRepository.findByAuthorAndDeletedFalse(testUser);

        // THEN
        assertEquals(2, result.size());
        result.forEach(post -> {
            assertEquals(testUser.getUserId(), post.getAuthor().getUserId());
            assertFalse(post.isDeleted());
        });
    }

    @Test
    void testFindByPostStatusAndDeletedFalse_ShouldReturnByStatus() {
        // WHEN
        List<Post> result = postRepository.findByPostStatusAndDeletedFalse(PostStatus.OPEN);

        // THEN
        assertEquals(2, result.size());
        result.forEach(post -> assertEquals(PostStatus.OPEN, post.getPostStatus()));
    }

    @Test
    void testFindByTitleContainingIgnoreCaseAndDeletedFalse_ShouldSearchByTitle() {
        // WHEN
        List<Post> result = postRepository.findByTitleContainingIgnoreCaseAndDeletedFalse("pinned");

        // THEN
        assertEquals(1, result.size());
        assertEquals("Pinned Post", result.get(0).getTitle());
    }

    @Test
    void testFindByTitleContainingIgnoreCase_ShouldBeCaseInsensitive() {
        // WHEN
        List<Post> resultLower = postRepository.findByTitleContainingIgnoreCaseAndDeletedFalse("normal");
        List<Post> resultUpper = postRepository.findByTitleContainingIgnoreCaseAndDeletedFalse("NORMAL");

        // THEN
        assertEquals(resultLower.size(), resultUpper.size());
        assertEquals(1, resultLower.size());
    }
}