package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Post;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.entities.Vote;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    // check if user already voted on a post
    boolean existsByUserAndPost(User user, Post post);
    // find vote to delete it (unvote)
    Optional<Vote> findByUserAndPost(User user, Post post);
    // count votes for a post
    long countByPost(Post post);
}