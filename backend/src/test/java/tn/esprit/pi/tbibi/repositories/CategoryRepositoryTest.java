package tn.esprit.pi.tbibi.repositories;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import tn.esprit.pi.tbibi.entities.Category;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest  // ← Sets up in-memory H2 database for testing
class CategoryRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;  // ← Helper to manage test data

    @Autowired
    private CategoryRepository categoryRepository;

    private Category activeCategory;
    private Category inactiveCategory;

    @BeforeEach
    void setUp() {
        // Create test data
        activeCategory = Category.builder()
                .categoryName("General Health")
                .categoryDescription("General discussions")
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();

        inactiveCategory = Category.builder()
                .categoryName("Archived Category")
                .categoryDescription("Old category")
                .createdAt(LocalDateTime.now())
                .active(false)  // ← Inactive
                .build();

        // Save to test database
        entityManager.persist(activeCategory);
        entityManager.persist(inactiveCategory);
        entityManager.flush();  // Force save to DB
    }

    @Test
    void testFindByActiveTrue_ShouldReturnOnlyActiveCategories() {
        // WHEN
        List<Category> result = categoryRepository.findByActiveTrue();

        // THEN
        assertEquals(1, result.size());
        assertTrue(result.get(0).getActive());
        assertEquals("General Health", result.get(0).getCategoryName());
    }

    @Test
    void testFindByActiveTrue_WhenNoActiveCategories_ShouldReturnEmpty() {
        // GIVEN: Deactivate all categories
        activeCategory.setActive(false);
        entityManager.persist(activeCategory);
        entityManager.flush();

        // WHEN
        List<Category> result = categoryRepository.findByActiveTrue();

        // THEN
        assertTrue(result.isEmpty());
    }

    @Test
    void testSaveCategory_Success() {
        // GIVEN
        Category newCategory = Category.builder()
                .categoryName("New Category")
                .categoryDescription("Test")
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();

        // WHEN
        Category saved = categoryRepository.save(newCategory);

        // THEN
        assertNotNull(saved.getCategoryId());
        assertEquals("New Category", saved.getCategoryName());
    }
}