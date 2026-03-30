package tn.esprit.pi.tbibi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("=== EXECUTING DATABASE FIX ===");
            jdbcTemplate.execute("ALTER TABLE medical_reccords MODIFY COLUMN image_url LONGTEXT;");
            System.out.println("=== DATABASE FIX COMPLETED SUCCESSFULLY ===");
        } catch (Exception e) {
            System.out.println("=== DATABASE FIX FAILED OR ALREADY APPLIED: " + e.getMessage() + " ===");
        }
    }
}
