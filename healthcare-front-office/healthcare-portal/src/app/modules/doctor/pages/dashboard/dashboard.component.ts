import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, UserProfileDTO } from '../../../../services/user.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { DoctorAppointmentService } from '../../services/doctor-appointment.service';
import { AppointmentResponse } from '../../../patient/services/appointment.service';

@Component({
    selector: 'app-doctor-dashboard',
    template: `
    <div class="dashboard-wrapper">
      <!-- Header -->
      <header class="dashboard-header animate-fade-in-up">
        <div class="header-content">
          <h1 class="page-title">Doctor Dashboard</h1>
          <p class="welcome-text">
            <span *ngIf="isLoading" class="skeleton skeleton-text" style="width: 150px; display: inline-block;"></span>
            <span *ngIf="!isLoading">Welcome back, <span class="doctor-name">{{ doctorName }}</span></span>
          </p>
        </div>
        <div class="avatar-circle">
          <span *ngIf="isLoading" class="skeleton skeleton-circle" style="width: 100%; height: 100%;"></span>
          <span *ngIf="!isLoading">{{ doctorName.charAt(0) || 'D' | uppercase }}</span>
        </div>
      </header>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <!-- Total Patients -->
        <div class="stat-card animate-fade-in-up" style="animation-delay: 0.1s;">
          <div class="stat-card-bg stat-bg-blue"></div>
          <div class="stat-content">
            <div class="stat-header">
              <div class="stat-icon-wrapper icon-blue">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span class="stat-label">Total Patients</span>
            </div>
            <div *ngIf="isLoading" class="skeleton skeleton-text" style="width: 60px; height: 36px;"></div>
            <p *ngIf="!isLoading" class="stat-value">{{ totalPatients }}</p>
          </div>
        </div>

        <!-- Total Appointments -->
        <div class="stat-card animate-fade-in-up" style="animation-delay: 0.2s;" (click)="goToAllAppointments()">
          <div class="stat-card-bg stat-bg-purple"></div>
          <div class="stat-content">
            <div class="stat-header">
              <div class="stat-icon-wrapper icon-purple">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
              </div>
              <span class="stat-label">All Appointments</span>
            </div>
            <div *ngIf="isLoading" class="skeleton skeleton-text" style="width: 60px; height: 36px;"></div>
            <p *ngIf="!isLoading" class="stat-value">{{ totalAppointments }}</p>
          </div>
        </div>

        <!-- Today's Appointments -->
        <div class="stat-card animate-fade-in-up" style="animation-delay: 0.3s;">
          <div class="stat-card-bg stat-bg-emerald"></div>
          <div class="stat-content">
            <div class="stat-header">
              <div class="stat-icon-wrapper icon-emerald">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span class="stat-label">Today's Appointments</span>
            </div>
            <div *ngIf="isLoading" class="skeleton skeleton-text" style="width: 60px; height: 36px;"></div>
            <p *ngIf="!isLoading" class="stat-value">{{ todayAppointments.length }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <section class="schedule-section animate-fade-in-up" style="animation-delay: 0.4s;">
        <div class="schedule-header">
          <h3 class="schedule-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-indigo"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Today's Schedule
          </h3>
          <span *ngIf="!isLoading" class="badge-count">{{ todayAppointments.length }} Pending</span>
          <span *ngIf="isLoading" class="skeleton skeleton-text" style="width: 80px; height: 24px; border-radius: 9999px;"></span>
        </div>
        
        <div class="schedule-list">
          <!-- Skeletons -->
          <ng-container *ngIf="isLoading">
            <div *ngFor="let i of [1,2,3]" class="appointment-card skeleton-card">
              <div class="patient-avatar skeleton skeleton-circle"></div>
              <div class="appointment-details">
                <div class="skeleton skeleton-text mb-2" style="width: 120px; height: 16px;"></div>
                <div class="skeleton skeleton-text" style="width: 180px; height: 12px;"></div>
              </div>
              <div class="appointment-actions">
                <div class="skeleton skeleton-text" style="width: 80px; height: 24px; border-radius: 9999px;"></div>
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="!isLoading">
            <div *ngIf="todayAppointments.length === 0" class="empty-state">
              <div class="empty-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p class="empty-title">No appointments today</p>
              <p class="empty-subtitle">You have a clear schedule for the rest of the day.</p>
            </div>

            <div *ngFor="let apt of todayAppointments" class="appointment-card hover-lift">
              <div class="patient-avatar">
                {{ apt.patientName?.charAt(0) || 'P' | uppercase }}
              </div>
              <div class="appointment-details">
                <p class="patient-name">{{ apt.patientName }}</p>
                <div class="appointment-meta">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{{ apt.scheduleTime?.substring(0,5) || 'TBD' }}</span>
                  <span class="meta-dot">•</span> 
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>{{ apt.service || 'Consultation' }}</span>
                </div>
              </div>
              <div class="appointment-actions">
                <span class="status-badge" [ngClass]="getStatusClass(apt.statusAppointement)">
                  {{ apt.statusAppointement || 'PENDING' }}
                </span>
              </div>
            </div>
          </ng-container>
        </div>
      </section>
    </div>
    `,
    styles: [`
      /* UI/UX Pro Max Core Styles */
      :host {
        display: block;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
        color: #0f172a;
        background-color: #f8fafc;
        min-height: 100vh;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      .dashboard-wrapper {
        padding: 2.5rem;
        max-width: 1280px;
        margin: 0 auto;
      }

      /* Animations */
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.5s ease-out forwards;
        opacity: 0;
      }

      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      .skeleton {
        background: #e2e8f0;
        background-image: linear-gradient(90deg, #e2e8f0 0px, #f1f5f9 40px, #e2e8f0 80px);
        background-size: 1000px 100%;
        animation: shimmer 2s infinite linear;
      }
      .skeleton-text { border-radius: 4px; }
      .skeleton-circle { border-radius: 50%; }

      /* Typography & Header */
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2.5rem;
        padding: 0.5rem 0;
      }

      .page-title {
        font-size: 2.25rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, #0f172a, #334155);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        margin-bottom: 0.35rem;
      }

      .welcome-text {
        color: #64748b;
        font-size: 1.05rem;
        font-weight: 500;
      }

      .doctor-name {
        color: #4f46e5;
        font-weight: 700;
      }

      .avatar-circle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4f46e5, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
        border: 2px solid white;
        transition: transform 0.3s ease;
      }
      .avatar-circle:hover {
        transform: scale(1.05) rotate(5deg);
      }

      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }

      .stat-card {
        background: white;
        border-radius: 1.25rem;
        padding: 1.75rem;
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
      }

      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02);
        border-color: #cbd5e1;
      }

      .stat-card-bg {
        position: absolute;
        top: -30px;
        right: -30px;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        opacity: 0.15;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .stat-card:hover .stat-card-bg {
        transform: scale(1.8);
        opacity: 0.25;
      }

      .stat-bg-blue { background-color: #3b82f6; }
      .stat-bg-purple { background-color: #a855f7; }
      .stat-bg-emerald { background-color: #10b981; }

      .stat-content {
        position: relative;
        z-index: 10;
      }

      .stat-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }

      .stat-icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon-blue { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }
      .icon-purple { background: #faf5ff; color: #a855f7; border: 1px solid #f3e8ff; }
      .icon-emerald { background: #ecfdf5; color: #10b981; border: 1px solid #d1fae5; }

      .stat-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 1;
        letter-spacing: -0.025em;
      }

      /* Main Content Area */
      .schedule-section {
        background: white;
        border-radius: 1.25rem;
        border: 1px solid rgba(226, 232, 240, 0.8);
        padding: 2rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
      }

      .schedule-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid #f1f5f9;
        margin-bottom: 1.5rem;
      }

      .schedule-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .icon-indigo {
        color: #4f46e5;
        background: #eef2ff;
        padding: 4px;
        border-radius: 6px;
        width: 28px;
        height: 28px;
      }

      .badge-count {
        background: linear-gradient(135deg, #eef2ff, #e0e7ff);
        color: #4f46e5;
        padding: 0.35rem 0.85rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 800;
        border: 1px solid #c7d2fe;
      }

      /* Lists & Items */
      .schedule-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 1rem;
        text-align: center;
      }

      .empty-icon-wrapper {
        width: 80px;
        height: 80px;
        background: #f8fafc;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        border: 1px dashed #cbd5e1;
      }

      .empty-icon {
        color: #94a3b8;
      }

      .empty-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: #334155;
        margin-bottom: 0.25rem;
      }

      .empty-subtitle {
        font-size: 0.875rem;
        color: #64748b;
      }

      .appointment-card {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding: 1.25rem;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 1rem;
        transition: all 0.2s ease;
      }

      .hover-lift:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
        border-color: #cbd5e1;
        background-color: #f8fafc;
      }

      .patient-avatar {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #475569;
        font-weight: 800;
        font-size: 1.125rem;
        border: 1px solid #cbd5e1;
      }

      .appointment-details {
        flex: 1;
      }

      .patient-name {
        font-weight: 700;
        color: #0f172a;
        font-size: 1.05rem;
        margin-bottom: 0.35rem;
      }

      .appointment-meta {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.875rem;
        color: #64748b;
        font-weight: 500;
      }

      .meta-dot {
        margin: 0 0.35rem;
        color: #cbd5e1;
      }

      /* Status Badges */
      .status-badge {
        padding: 0.4rem 1rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: 1px solid transparent;
        display: inline-block;
      }

      .status-confirmed { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
      .status-cancelled { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
      .status-pending { background: #fffbeb; color: #d97706; border-color: #fde68a; }
      
      @media (max-width: 768px) {
        .dashboard-wrapper { padding: 1rem; }
        .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
        .avatar-circle { align-self: flex-end; margin-top: -4rem; }
        .appointment-card { flex-direction: column; align-items: flex-start; }
        .appointment-actions { align-self: flex-end; width: 100%; text-align: right; }
      }
    `]
})
export class DoctorDashboardComponent implements OnInit {
    doctorName: string = '';
    totalPatients: number = 0;
    totalAppointments: number = 0;
    todayAppointments: AppointmentResponse[] = [];
    allAppointments: AppointmentResponse[] = [];
    isLoading: boolean = true;

    constructor(
      private userService: UserService,
      private authService: AuthService,
      private appointmentService: DoctorAppointmentService,
      private router: Router
    ) {}

    ngOnInit(): void {
        this.loadDoctorProfile();
        this.loadAppointments();
    }

    loadDoctorProfile() {
      this.userService.getProfile().subscribe({
        next: (profile) => {
          this.doctorName = profile.name || 'Doctor';
        },
        error: (err) => console.error('Failed to load profile', err)
      });
    }

    loadAppointments() {
      const doctorId = this.authService.getUserId();
      if (!doctorId) {
        this.isLoading = false;
        return;
      }

      this.appointmentService.getDoctorAppointments(doctorId).subscribe({
        next: (appointments) => {
          this.allAppointments = appointments || [];
          this.totalAppointments = this.allAppointments.length;
          
          // Calculate unique patients
          const uniquePatients = new Set(this.allAppointments.map(a => a.patientName).filter(name => !!name));
          this.totalPatients = uniquePatients.size;

          // Filter today's appointments
          const today = new Date().toISOString().split('T')[0];
          this.todayAppointments = this.allAppointments.filter(apt => {
            if (!apt.scheduleDate) return false;
            // Handle parsing safely
            try {
              const aptDate = new Date(apt.scheduleDate).toISOString().split('T')[0];
              return aptDate === today;
            } catch (e) {
              return false;
            }
          });

          // Sort today's appointments by start time
          this.todayAppointments.sort((a, b) => {
             const timeA = a.scheduleTime || '';
             const timeB = b.scheduleTime || '';
             return timeA.localeCompare(timeB);
          });
          
          // Add a slight delay to demonstrate the beautiful skeleton loading 
          // (Can be removed in pure production, but feels great for UX)
          setTimeout(() => {
            this.isLoading = false;
          }, 600);
        },
        error: (err) => {
          console.error('Failed to load appointments', err);
          this.isLoading = false;
        }
      });
    }

    getStatusClass(status: string): string {
      switch(status) {
        case 'CONFIRMED': return 'status-confirmed';
        case 'CANCELLED': return 'status-cancelled';
        case 'PENDING': default: return 'status-pending';
      }
    }

    goToAllAppointments(): void {
      this.router.navigate(['/doctor/all-appointments']);
    }
}
