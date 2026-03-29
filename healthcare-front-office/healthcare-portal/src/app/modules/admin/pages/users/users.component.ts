import { Component, OnInit } from '@angular/core';
import { AdminService, AdminUser } from '../../../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  loading = false;
  error = '';
  roleFilter = 'ALL';
  statusFilter = 'ALL';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        console.log('Admin users loaded:', data);
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Erreur lors du chargement des utilisateurs (' + (err.status || err.message) + ').';
        this.loading = false;
      }
    });
  }

  get filteredUsers() {
    return this.users.filter(u => {
      const roleName = (u.roleName ?? '').toUpperCase();
      const matchRole = this.roleFilter === 'ALL' || roleName === this.roleFilter.toUpperCase();
      const matchStatus = this.statusFilter === 'ALL' || u.accountStatus === this.statusFilter;
      return matchRole && matchStatus;
    });
  }

  updateStatus(userId: number, status: 'PENDING' | 'ACTIVE' | 'BLOCKED' | 'REJECTED'): void {
    if (!confirm(`Voulez-vous vraiment changer le statut à ${status} ?`)) return;
    this.adminService.updateUserStatus(userId, status).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        console.error('Update status error:', err);
        // Optimistic UI update
        const u = this.users.find(u => u.userId === userId);
        if (u) u.accountStatus = status;
      }
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Suppression définitive de ce compte. Continuer ?')) return;
    this.adminService.deleteUser(userId).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        console.error('Delete error:', err);
        // Optimistic UI update
        this.users = this.users.filter(u => u.userId !== userId);
      }
    });
  }

  getRoleBadgeColor(roleName: string): string {
    const r = (roleName || '').toUpperCase();
    if (r === 'DOCTOR') return '#dbeafe';
    if (r === 'PATIENT') return '#dcfce7';
    if (r === 'PHARMACIST') return '#fef9c3';
    if (r === 'LABORATORY' || r === 'LAB') return '#f3e8ff';
    if (r === 'ADMIN') return '#fee2e2';
    return '#f1f5f9';
  }

  getRoleBadgeText(roleName: string): string {
    const r = (roleName || '').toUpperCase();
    if (r === 'DOCTOR') return '#1d4ed8';
    if (r === 'PATIENT') return '#15803d';
    if (r === 'PHARMACIST') return '#854d0e';
    if (r === 'LABORATORY' || r === 'LAB') return '#7c3aed';
    if (r === 'ADMIN') return '#dc2626';
    return '#475569';
  }

  getInitial(name: string): string {
    return (name || '?').charAt(0).toUpperCase();
  }
}
