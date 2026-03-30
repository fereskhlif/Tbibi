package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.Comment;
import tn.esprit.pi.tbibi.entities.CommentVote;
import tn.esprit.pi.tbibi.entities.User;

import java.util.Optional;

@Repository
public interface CommentVoteRepository extends JpaRepository<CommentVote, Long> {
    long countByComment(Comment comment);
    boolean existsByUserAndComment(User user, Comment comment);
    Optional<CommentVote> findByUserAndComment(User user, Comment comment);
}
