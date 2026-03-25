package tn.esprit.pi.tbibi.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.entities.Role;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.entities.UserStatus;
import tn.esprit.pi.tbibi.repositories.RoleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        Role adminRole = roleRepo.findByRoleName("ADMIN");
        if (adminRole == null) {
            adminRole = new Role();
            adminRole.setRoleName("ADMIN");
            adminRole = roleRepo.save(adminRole);
        }

        // Check if our default admin already exists
        var existingAdminOpt = userRepo.findByEmail("admin@tbibi.tn");
        if (existingAdminOpt.isEmpty()) {
            User admin = User.builder()
                    .name("Super Administrateur")
                    .email("admin@tbibi.tn")
                    .password(passwordEncoder.encode("admin123"))
                    .role(adminRole)
                    .accountStatus(UserStatus.ACTIVE)
                    .enabled(true)
                    .build();
            
            userRepo.save(admin);
            log.info("========================================================");
            log.info("✅ Default Admin account created successfully:");
            log.info("📧 Email: admin@tbibi.tn");
            log.info("🔑 Password: admin123");
            log.info("Role: ADMIN | Status: ACTIVE");
            log.info("========================================================");
        } else {
            // Force reset the password and status if it already existed (maybe from an old test)
            User existingAdmin = existingAdminOpt.get();
            existingAdmin.setPassword(passwordEncoder.encode("admin123"));
            existingAdmin.setRole(adminRole);
            existingAdmin.setAccountStatus(UserStatus.ACTIVE);
            existingAdmin.setEnabled(true);
            userRepo.save(existingAdmin);
            
            log.info("⚡ Admin account already existed. Forced password reset to 'admin123' and role to ADMIN.");
        }
    }
}
