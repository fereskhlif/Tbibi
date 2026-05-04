package tn.esprit.pi.tbibi.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Applies schema patches that Hibernate's ddl-auto=update cannot handle,
 * such as adding AUTO_INCREMENT to an existing primary key column.
 *
 * Each statement is wrapped in a try/catch so a single failure does not
 * prevent the application from starting.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseMigrationRunner {

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void applyPatches() {
        log.info("=== [DatabaseMigrationRunner] Applying schema patches ===");

        // Fix missing AUTO_INCREMENT on appointement.appointement_id
        applyAlter(
            "ALTER TABLE appointement MODIFY COLUMN appointement_id BIGINT NOT NULL AUTO_INCREMENT",
            "appointement.appointement_id → AUTO_INCREMENT"
        );

        log.info("=== [DatabaseMigrationRunner] Done ===");
    }

    private void applyAlter(String sql, String description) {
        try {
            jdbcTemplate.execute(sql);
            log.info("[PATCH OK] {}", description);
        } catch (Exception e) {
            // Already has AUTO_INCREMENT or table doesn't exist yet — safe to ignore
            log.warn("[PATCH SKIP] {} — {}", description, e.getMessage());
        }
    }
}
