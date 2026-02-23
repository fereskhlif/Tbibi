package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.ForumPost;

public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {
}
