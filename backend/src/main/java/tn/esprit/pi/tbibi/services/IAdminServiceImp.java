package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.DTO.AdminDashboardStats;
import tn.esprit.pi.tbibi.DTO.UserAdminResponse;
import tn.esprit.pi.tbibi.entities.Pharmacy;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.entities.UserStatus;
import tn.esprit.pi.tbibi.repositories.PharmacyRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class IAdminServiceImp implements IAdminService {

    private final UserRepo userRepository;
    private final PharmacyRepository pharmacyRepository;

    @Override
    public List<UserAdminResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserAdminResponse> getPendingApprovals() {
        return userRepository.findAll().stream()
                .filter(u -> UserStatus.PENDING.equals(u.getAccountStatus()))
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void updateUserStatus(int userId, UserStatus status) {
        log.info("Admin is updating status for user {} to {}", userId, status);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        user.setAccountStatus(status);

        if (status == UserStatus.ACTIVE && user.getRole() != null) {
            String roleName = user.getRole().getRoleName().toUpperCase();
            if (roleName.equals("PHARMACIEN") || roleName.equals("PHARMASIS") || roleName.equals("PHARMACIST")) {
                Pharmacy centralPharmacy = pharmacyRepository.findAll().stream()
                        .filter(p -> "Central Pharmacy".equals(p.getPharmacyName()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("Central Pharmacy not found in database"));
                user.setPharmacy(centralPharmacy);
            }
        }

        userRepository.save(user);
    }

    @Override
    public void deleteUser(int userId) {
        log.info("Admin is deleting user {}", userId);
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    @Override
    public AdminDashboardStats getDashboardStats() {
        List<User> allUsers = userRepository.findAll();

        long totalUsers = allUsers.size();

        long activeProfessionals = allUsers.stream()
                .filter(u -> {
                    try {
                        return UserStatus.ACTIVE.equals(u.getAccountStatus()) &&
                                u.getRole() != null &&
                                !u.getRole().getRoleName().equalsIgnoreCase("PATIENT") &&
                                !u.getRole().getRoleName().equalsIgnoreCase("ADMIN");
                    } catch (Exception e) {
                        return false; // skip users with orphaned/missing roles
                    }
                })
                .count();

        long pendingApprovals = allUsers.stream()
                .filter(u -> UserStatus.PENDING.equals(u.getAccountStatus()))
                .count();

        long blockedUsers = allUsers.stream()
                .filter(u -> UserStatus.BLOCKED.equals(u.getAccountStatus()))
                .count();

        return new AdminDashboardStats(totalUsers, activeProfessionals, pendingApprovals, blockedUsers);
    }

    private UserAdminResponse mapToAdminResponse(User user) {
        tn.esprit.pi.tbibi.entities.Role cleanRole = null;
        if (user.getRole() != null) {
            try {
                cleanRole = new tn.esprit.pi.tbibi.entities.Role();
                cleanRole.setRole_id(user.getRole().getRole_id());
                cleanRole.setRoleName(user.getRole().getRoleName());
            } catch (Exception e) {
                // Role FK exists but the role row was deleted from DB — skip gracefully
                cleanRole = null;
            }
        }

        return UserAdminResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(cleanRole)
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .accountStatus(user.getAccountStatus() != null ? user.getAccountStatus() : UserStatus.ACTIVE)
                .enabled(user.getEnabled() != null ? user.getEnabled() : true)
                .profilePicture(user.getProfilePicture())
                .build();
    }
}
