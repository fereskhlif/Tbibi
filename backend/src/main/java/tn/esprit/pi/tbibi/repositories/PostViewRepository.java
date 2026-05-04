package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.PostView;

public interface PostViewRepository extends JpaRepository<PostView, Long> {
    boolean existsByPostPostIdAndUserId(Long postId, Integer userId);
}
