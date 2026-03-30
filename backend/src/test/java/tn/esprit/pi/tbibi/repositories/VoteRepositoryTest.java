package tn.esprit.pi.tbibi.repositories;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import tn.esprit.pi.tbibi.entities.*;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class VoteRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private VoteRepository voteRepository;

    private User user1;
    private User user2;
    private Category testCategory;
    private Post testPost;
    private Vote vote1;

    @BeforeEach
    void setUp() {
        user1 = User.builder()
                .name("User 1")
                .email("user1@test.com")
                .build();
        entityManager.persist(user1);

        user2 = User.builder()
                .name("User 2")
                .email("user2@test.com")
                .build();
        entityManager.persist(user2);

        testCategory = Category.builder()
                .categoryName("Health")
                .categoryDescription("Health")
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();
        entityManager.persist(testCategory);

        testPost = Post.builder()
                .title("Test Post")
                .content("Content")
                .author(user1)
                .category(testCategory)
                .createdDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .postStatus(PostStatus.OPEN)
                .views(0)
                .pinned(false)
                .deleted(false)
                .build();
        entityManager.persist(testPost);

        vote1 = Vote.builder()
                .user(user1)
                .post(testPost)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(vote1);

        entityManager.flush();
    }

    @Test
    void testExistsByUserAndPost_WhenVoteExists_ShouldReturnTrue() {
        boolean exists = voteRepository.existsByUserAndPost(user1, testPost);
        assertTrue(exists);
    }

    @Test
    void testExistsByUserAndPost_WhenVoteDoesNotExist_ShouldReturnFalse() {
        boolean exists = voteRepository.existsByUserAndPost(user2, testPost);
        assertFalse(exists);
    }

    @Test
    void testFindByUserAndPost_WhenVoteExists_ShouldReturnVote() {
        Optional<Vote> result = voteRepository.findByUserAndPost(user1, testPost);
        assertTrue(result.isPresent());
        assertEquals(vote1.getVoteId(), result.get().getVoteId());
    }

    @Test
    void testFindByUserAndPost_WhenVoteDoesNotExist_ShouldReturnEmpty() {
        Optional<Vote> result = voteRepository.findByUserAndPost(user2, testPost);
        assertTrue(result.isEmpty());
    }

    @Test
    void testCountByPost_ShouldReturnCorrectCount() {
        Vote vote2 = Vote.builder()
                .user(user2)
                .post(testPost)
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persist(vote2);
        entityManager.flush();

        long count = voteRepository.countByPost(testPost);
        assertEquals(2, count);
    }

    @Test
    void testCountByPost_WhenNoVotes_ShouldReturnZero() {
        Post newPost = Post.builder()
                .title("New Post")
                .content("No votes")
                .author(user1)
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

        long count = voteRepository.countByPost(newPost);
        assertEquals(0, count);
    }

    @Test
    void testSaveVote_ShouldPreventDuplicate() {
        Vote duplicateVote = Vote.builder()
                .user(user1)
                .post(testPost)
                .createdAt(LocalDateTime.now())
                .build();

        assertThrows(Exception.class, () -> {
            entityManager.persist(duplicateVote);
            entityManager.flush();
        });
    }
}