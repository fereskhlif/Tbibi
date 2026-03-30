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
class CommentRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CommentRepository commentRepository;

    private User testUser;
    private Category testCategory;
    private Post testPost;
    private Comment topLevelComment;
    private Comment replyComment;
    private Comment deletedComment;

    @BeforeEach
    void setUp() {
        // Create user
        testUser = User.builder()
                .name("John Doe")
                .email("john@test.com")
                .build();
        entityManager.persist(testUser);

        // Create category
        testCategory = Category.builder()
                .categoryName("Health")
                .categoryDescription("Health")
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();
        entityManager.persist(testCategory);

        // Create post
        testPost = Post.builder()
                .title("Test Post")
                .content("Content")
                .author(testUser)
                .category(testCategory)
                .createdDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .postStatus(PostStatus.OPEN)
                .views(0)
                .pinned(false)
                .deleted(false)
                .build();
        entityManager.persist(testPost);

        // Create top-level comment
        topLevelComment = Comment.builder()
                .comment("Top level comment")
                .author(testUser)
                .post(testPost)
                .commentDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .deleted(false)
                .parentComment(null)  // ← No parent = top level
                .build();
        entityManager.persist(topLevelComment);

        // Create reply to comment
        replyComment = Comment.builder()
                .comment("Reply to comment")
                .author(testUser)
                .post(testPost)
                .commentDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .deleted(false)
                .parentComment(topLevelComment)  // ← Has parent = reply
                .build();
        entityManager.persist(replyComment);

        // Create deleted comment
        deletedComment = Comment.builder()
                .comment("Deleted comment")
                .author(testUser)
                .post(testPost)
                .commentDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .deleted(true)  // ← Deleted
                .parentComment(null)
                .build();
        entityManager.persist(deletedComment);

        entityManager.flush();
    }

    @Test
    void testFindByPostAndParentCommentIsNullAndDeletedFalse_ShouldReturnOnlyTopLevelComments() {
        // WHEN
        List<Comment> result = commentRepository.findByPostAndParentCommentIsNullAndDeletedFalse(testPost);

        // THEN
        assertEquals(1, result.size());  // Only 1 non-deleted top-level comment
        assertNull(result.get(0).getParentComment());
        assertEquals("Top level comment", result.get(0).getComment());
    }

    @Test
    void testFindByParentCommentAndDeletedFalse_ShouldReturnReplies() {
        // WHEN
        List<Comment> result = commentRepository.findByParentCommentAndDeletedFalse(topLevelComment);

        // THEN
        assertEquals(1, result.size());
        assertEquals("Reply to comment", result.get(0).getComment());
        assertEquals(topLevelComment.getCommentId(), result.get(0).getParentComment().getCommentId());
    }

    @Test
    void testCountByPostAndDeletedFalse_ShouldCountAllNonDeletedComments() {
        // WHEN
        long count = commentRepository.countByPostAndDeletedFalse(testPost);

        // THEN
        assertEquals(2, count);  // 1 top-level + 1 reply (deleted one excluded)
    }

    @Test
    void testFindByPostAndParentCommentIsNullAndDeletedFalse_WhenNoComments_ShouldReturnEmpty() {
        // GIVEN: Create a new post with no comments
        Post newPost = Post.builder()
                .title("Empty Post")
                .content("No comments")
                .author(testUser)
                .category(testCategory)
                .createdDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .postStatus(PostStatus.OPEN)
                .views(0)
                .pinned(false)
                .deleted(false)
                .build();
        entityManager.persist(newPost);
        entityManager.flush();

        // WHEN
        List<Comment> result = commentRepository.findByPostAndParentCommentIsNullAndDeletedFalse(newPost);

        // THEN
        assertTrue(result.isEmpty());
    }
}