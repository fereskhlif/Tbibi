package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.ForumComment;

public interface ForumCommentRepository extends JpaRepository<ForumComment, Long> {
}
