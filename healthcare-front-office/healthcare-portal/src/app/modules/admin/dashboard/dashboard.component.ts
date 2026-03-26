import { Component, OnInit } from '@angular/core';
import { AdminService, AdminStats } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
  <div class="min-h-screen bg-gray-50 p-6 lg:p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard Administrateur</h1>
      <p class="text-sm text-gray-500 mt-0.5">Vue d'ensemble de la plateforme Tbibi</p>
    </div>

    <!-- Error/Loading state -->
    <div *ngIf="loading" class="text-gray-500 mb-6">Chargement des statistiques...</div>
    <div *ngIf="error" class="bg-red-50 text-red-600 p-4 rounded-xl mb-6">⚠️ {{error}}</div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" *ngIf="stats">
      <!-- Total Users -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl">👥</div>
          <span class="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+12%</span>
        </div>
        <p class="text-3xl font-extrabold text-gray-900">{{stats.totalUsers}}</p>
        <p class="text-sm font-medium text-gray-500 mt-1">Utilisateurs Totaux</p>
      </div>

      <!-- Active Professionals -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">🩺</div>
        </div>
        <p class="text-3xl font-extrabold text-gray-900">{{stats.activeProfessionals}}</p>
        <p class="text-sm font-medium text-gray-500 mt-1">Professionnels Actifs</p>
      </div>

      <!-- Pending Approvals -->
      <div class="bg-white rounded-2xl border-2 border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 z-0"></div>
        <div class="relative z-10 flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-2xl">⏳</div>
        </div>
        <p class="relative z-10 text-3xl font-extrabold text-orange-600">{{stats.pendingApprovals}}</p>
        <p class="relative z-10 text-sm font-medium text-orange-700 mt-1">Comptes en Attente</p>
      </div>

      <!-- Blocked Users -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-2xl">🚫</div>
        </div>
        <p class="text-3xl font-extrabold text-gray-900">{{stats.blockedUsers}}</p>
        <p class="text-sm font-medium text-gray-500 mt-1">Comptes Bloqués</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h2>
      <div class="flex flex-wrap gap-4">
        <a routerLink="/admin/approvals" class="px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
          Gérer les approbations <span class="bg-white/20 px-2 py-0.5 rounded-lg text-xs">{{stats?.pendingApprovals || 0}}</span>
        </a>
        <a routerLink="/admin/users" class="px-5 py-3 bg-white text-gray-700 border border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
          Annuaire des utilisateurs
        </a>
      </div>
    </div>
  </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  loading = false;
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = "Erreur de connexion au serveur (Mock data utilisée).";
        this.loading = false;
        // Mock data for UI development
        this.stats = { totalUsers: 1450, activeProfessionals: 320, pendingApprovals: 12, blockedUsers: 5 };
      }
    });
  }
}
