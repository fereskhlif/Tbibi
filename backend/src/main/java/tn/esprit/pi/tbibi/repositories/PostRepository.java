package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // ─── MULTI-CATEGORY METHODS ───
    
    // Page in multiple categories
    Page<Post> findByCategoryCategoryIdInAndDeletedFalse(List<Long> categoryIds, Pageable pageable);
    
    // Page in multiple categories + status
    Page<Post> findByCategoryCategoryIdInAndPostStatusAndDeletedFalse(List<Long> categoryIds, PostStatus status, Pageable pageable);
    
    // Search in multiple categories
    Page<Post> findByTitleContainingIgnoreCaseAndCategoryCategoryIdInAndDeletedFalse(String keyword, List<Long> categoryIds, Pageable pageable);
    
    // Search in multiple categories + status
    Page<Post> findByTitleContainingIgnoreCaseAndCategoryCategoryIdInAndPostStatusAndDeletedFalse(String keyword, List<Long> categoryIds, PostStatus status, Pageable pageable);

    // Count by category
    long countByCategoryAndDeletedFalse(Category category);

    // Count unanswered in category
    // Note: We use a subquery to count comments because @Formula fields cannot be used in JPQL WHERE clauses.
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Post p WHERE p.category = :category AND p.deleted = false AND p.postStatus = :status AND (SELECT COUNT(c) FROM Comment c WHERE c.post = p AND c.deleted = false) = 0")
    long countUnansweredByCategory(@org.springframework.data.repository.query.Param("category") Category category, @org.springframework.data.repository.query.Param("status") PostStatus status);

    // for admin filtering by verdict
    List<Post> findByToxicityVerdictAndDeletedFalse(String verdict);

    // for admin stats
    long countByDeletedFalse();
    long countByToxicityVerdictAndDeletedFalse(String verdict);
    long countByToxicityVerdictIsNullAndDeletedFalse();

    @Query("""
    SELECT p,
    (
        CASE WHEN LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw1,'%')) THEN 3 ELSE 0 END +
        CASE WHEN LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw2,'%')) THEN 3 ELSE 0 END +
        CASE WHEN LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw3,'%')) THEN 3 ELSE 0 END +
        CASE WHEN LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw4,'%')) THEN 3 ELSE 0 END +
        CASE WHEN LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw5,'%')) THEN 3 ELSE 0 END +
        CASE WHEN LOWER(p.content) LIKE LOWER(CONCAT('%',:kw1,'%')) THEN 1 ELSE 0 END +
        CASE WHEN LOWER(p.content) LIKE LOWER(CONCAT('%',:kw2,'%')) THEN 1 ELSE 0 END +
        CASE WHEN LOWER(p.content) LIKE LOWER(CONCAT('%',:kw3,'%')) THEN 1 ELSE 0 END +
        CASE WHEN LOWER(p.content) LIKE LOWER(CONCAT('%',:kw4,'%')) THEN 1 ELSE 0 END +
        CASE WHEN LOWER(p.content) LIKE LOWER(CONCAT('%',:kw5,'%')) THEN 1 ELSE 0 END
    ) AS relevanceScore
    FROM Post p
    JOIN p.author u
    JOIN p.category c
    WHERE c.categoryId = :categoryId
      AND p.postId != :currentPostId
      AND p.deleted = false
      AND (p.toxicityScore IS NULL OR p.toxicityScore < 0.7)
      AND (
          LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw1,'%')) OR
          LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw2,'%')) OR
          LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw3,'%')) OR
          LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw4,'%')) OR
          LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw5,'%')) OR
          LOWER(p.content) LIKE LOWER(CONCAT('%',:kw1,'%')) OR
          LOWER(p.content) LIKE LOWER(CONCAT('%',:kw2,'%')) OR
          LOWER(p.content) LIKE LOWER(CONCAT('%',:kw3,'%')) OR
          LOWER(p.content) LIKE LOWER(CONCAT('%',:kw4,'%')) OR
          LOWER(p.content) LIKE LOWER(CONCAT('%',:kw5,'%'))
      )
    ORDER BY
    (
        CASE WHEN LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw1,'%')) THEN 3 ELSE 0 END +
        CASE WHEN LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw2,'%')) THEN 3 ELSE 0 END +
        CASE WHEN LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw3,'%')) THEN 3 ELSE 0 END +
        CASE WHEN LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw4,'%')) THEN 3 ELSE 0 END +
        CASE WHEN LOWER(p.title)   LIKE LOWER(CONCAT('%',:kw5,'%')) THEN 3 ELSE 0 END +
        CASE WHEN LOWER(p.content) LIKE LOWER(CONCAT('%',:kw1,'%')) THEN 1 ELSE 0 END +
        CASE WHEN LOWER(p.content) LIKE LOWER(CONCAT('%',:kw2,'%')) THEN 1 ELSE 0 END +
        CASE WHEN LOWER(p.content) LIKE LOWER(CONCAT('%',:kw3,'%')) THEN 1 ELSE 0 END +
        CASE WHEN LOWER(p.content) LIKE LOWER(CONCAT('%',:kw4,'%')) THEN 1 ELSE 0 END +
        CASE WHEN LOWER(p.content) LIKE LOWER(CONCAT('%',:kw5,'%')) THEN 1 ELSE 0 END
    ) DESC,
    p.voteCount DESC,
    p.createdDate DESC
    LIMIT 5
""")
    List<Object[]> findRelatedPosts(
            @Param("categoryId") Long categoryId,
            @Param("currentPostId") Long currentPostId,
            @Param("kw1") String kw1,
            @Param("kw2") String kw2,
            @Param("kw3") String kw3,
            @Param("kw4") String kw4,
            @Param("kw5") String kw5
    );
}