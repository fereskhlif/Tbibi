package tn.esprit.pi.tbibi.config;

import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.entities.Category;
import tn.esprit.pi.tbibi.repositories.CategoryRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@AllArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepo;

    @Override
    public void run(String... args) {
        if (categoryRepo.count() == 0) {
            List<Category> defaultCategories = Arrays.asList(
                createCategory("Ask a Doctor", "Get answers from doctors"),
                createCategory("Ask a Pharmacist", "Medication questions"),
                createCategory("General Health", "General health discussions"),
                createCategory("Mental Health", "Mental health support"),
                createCategory("Ask a Lab", "Questions about lab tests and results"),
                createCategory("Ask a Physiotherapist", "Physical therapy and recovery questions"),
                createCategory("Nutrition & Diet", "Questions about food, nutrition and healthy eating"),
                createCategory("Fitness & Wellness", "Exercise, fitness and wellness tips"),
                createCategory("Women Health", "Women specific health questions and discussions"),
                createCategory("Children Health", "Questions about child health and development"),
                createCategory("Chronic Diseases", "Living with and managing chronic conditions"),
                createCategory("Medications & Side Effects", "General questions about medications"),
                createCategory("First Aid & Emergencies", "Basic first aid and emergency questions"),
                createCategory("Healthy Lifestyle", "Sleep, stress management and healthy habits")
            );
            categoryRepo.saveAll(defaultCategories);
            System.out.println(">> Database initialized with default forum categories.");
        }
    }

    private Category createCategory(String name, String description) {
        return Category.builder()
                .categoryName(name)
                .categoryDescription(description)
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();
    }
}
