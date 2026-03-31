package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.esprit.pi.tbibi.entities.Category;
import tn.esprit.pi.tbibi.entities.Post;
import tn.esprit.pi.tbibi.entities.PostStatus;
import tn.esprit.pi.tbibi.entities.User;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    // get all posts — pinned first, newest after
    List<Post> findByDeletedFalseOrderByPinnedDescCreatedDateDesc();
    // get all posts in a category — pinned first, newest after
    List<Post> findByCategoryAndDeletedFalseOrderByPinnedDescCreatedDateDesc(Category category);
    // get posts by author
    List<Post> findByAuthorAndDeletedFalse(User author);
    // get posts by status
    List<Post> findByPostStatusAndDeletedFalse(PostStatus status);
    // search posts by title
    List<Post> findByTitleContainingIgnoreCaseAndDeletedFalse(String keyword);

    // ─── PAGINATED METHODS ───
    
    // Page with sorting
    Page<Post> findByDeletedFalse(Pageable pageable);
    
    // Page with status
    Page<Post> findByPostStatusAndDeletedFalse(PostStatus postStatus, Pageable pageable);
    
    // Page in category
    Page<Post> findByCategoryAndDeletedFalse(Category category, Pageable pageable);
    
    // Page in category + status
    Page<Post> findByCategoryAndPostStatusAndDeletedFalse(Category category, PostStatus postStatus, Pageable pageable);
    
    // Search with page
    Page<Post> findByTitleContainingIgnoreCaseAndDeletedFalse(String keyword, Pageable pageable);
    
    // Search with page + status
    Page<Post> findByTitleContainingIgnoreCaseAndPostStatusAndDeletedFalse(String keyword, PostStatus postStatus, Pageable pageable);

    // Count by category
    long countByCategoryAndDeletedFalse(Category category);

    // Count unanswered in category
    // Note: We use a subquery to count comments because @Formula fields cannot be used in JPQL WHERE clauses.
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Post p WHERE p.category = :category AND p.deleted = false AND p.postStatus = :status AND (SELECT COUNT(c) FROM Comment c WHERE c.post = p AND c.deleted = false) = 0")
    long countUnansweredByCategory(@org.springframework.data.repository.query.Param("category") Category category, @org.springframework.data.repository.query.Param("status") PostStatus status);
}