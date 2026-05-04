package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.pi.tbibi.entities.Comment;
import tn.esprit.pi.tbibi.entities.Post;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // get top level comments for a post (not replies)
    List<Comment> findByPostAndParentCommentIsNullAndDeletedFalse(Post post);
    // get replies for a comment
    List<Comment> findByParentCommentAndDeletedFalse(Comment parentComment);
    // count comments for a post
    long countByPostAndDeletedFalse(Post post);
    long countByPostAndPinnedTrueAndDeletedFalse(Post post);
    // for admin view (all comments of a post, including non-top-level)
    List<Comment> findByPostAndDeletedFalseOrderByCommentDateDesc(Post post);

    // for admin bulk soft-delete when post is deleted
    List<Comment> findByPostAndDeletedFalse(Post post);

    @Query("""
    SELECT c FROM Comment c
    JOIN c.author u
    JOIN u.role r
    JOIN c.post p
    WHERE c.post = :post
      AND c.parentComment IS NULL
      AND c.deleted = false
    ORDER BY
        CASE WHEN r.roleName IN ('DOCTOR','MEDECIN','DOCTEUR','PHARMACIST','PHARMACIEN','PHARMASIS','LABORATORY','LABORATOIRE','PHYSIOTHERAPIST','KINE')
             THEN 0 ELSE 1 END ASC,
        c.pinned DESC,
        c.commentDate ASC
""")
    List<Comment> findByPostOrderByExpertFirst(
            @Param("post") Post post
    );
}