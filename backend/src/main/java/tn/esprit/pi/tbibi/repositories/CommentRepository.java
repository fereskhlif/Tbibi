package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
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
}