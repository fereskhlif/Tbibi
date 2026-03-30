package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.AdminDashboardStats;
import tn.esprit.pi.tbibi.DTO.UserAdminResponse;
import tn.esprit.pi.tbibi.entities.UserStatus;

import java.util.List;

public interface IAdminService {
    List<UserAdminResponse> getAllUsers();
    List<UserAdminResponse> getPendingApprovals();
    void updateUserStatus(int userId, UserStatus status);
    void deleteUser(int userId);
    AdminDashboardStats getDashboardStats();
}
