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
        fixAppointementAutoIncrement();
        log.info("=== [DatabaseMigrationRunner] Done ===");
    }

    /**
     * Adds AUTO_INCREMENT to appointement.appointement_id.
     * Detects the actual column type from information_schema to build the correct ALTER.
     */
    /**
     * The 'appointement' table was originally created manually with a column
     * 'appointement_id' (NOT NULL, no AUTO_INCREMENT, no default).
     * Hibernate manages 'appointment_id' as the real PK (AUTO_INCREMENT).
     * To prevent INSERT failures, we make 'appointement_id' nullable.
     */
    private void fixAppointementAutoIncrement() {
        try {
            // Check if the orphan 'appointement_id' column is still NOT NULL
            String isNullable = jdbcTemplate.queryForObject(
                "SELECT IS_NULLABLE FROM information_schema.COLUMNS " +
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointement' " +
                "AND COLUMN_NAME = 'appointement_id'",
                String.class
            );
            if ("NO".equals(isNullable)) {
                // Detect column type first
                String colType = jdbcTemplate.queryForObject(
                    "SELECT DATA_TYPE FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointement' " +
                    "AND COLUMN_NAME = 'appointement_id'",
                    String.class
                );
                String sqlType = (colType != null && colType.toLowerCase().contains("big")) ? "BIGINT" : "INT";
                applyAlter(
                    "ALTER TABLE appointement MODIFY COLUMN appointement_id " + sqlType + " NULL DEFAULT NULL",
                    "appointement_id → nullable (removes NOT NULL constraint)"
                );
            } else {
                log.info("[PATCH SKIP] appointement_id is already nullable or does not exist.");
            }
        } catch (Exception e) {
            log.warn("[PATCH] Could not inspect appointement_id nullability: {}", e.getMessage());
        }
    }

    private void applyAlter(String sql, String description) {
        try {
            jdbcTemplate.execute(sql);
            log.info("[PATCH OK] {}", description);
        } catch (Exception e) {
            log.warn("[PATCH SKIP] {} — {}", description, e.getMessage());
        }
    }
}
