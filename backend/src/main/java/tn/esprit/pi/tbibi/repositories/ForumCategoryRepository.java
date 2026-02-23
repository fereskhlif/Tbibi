package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.ForumCategory;

public interface ForumCategoryRepository extends JpaRepository<ForumCategory, Long> {
}
