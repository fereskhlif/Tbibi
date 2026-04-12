import { Component, OnInit, OnDestroy } from '@angular/core';
import { DoctorNotificationService, NotificationDTO } from '../../services/doctor-notification.service';
import { PrescriptionService } from '../../../../services/prescription-service.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-doctor-notifications',
    template: `
    <div class="p-8 max-w-3xl mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Notifications & Requests</h1>
          <p class="text-gray-500 mt-1">Review new appointments and prescription renewals</p>
        </div>
        <span *ngIf="unreadCount > 0"
          class="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
          {{unreadCount}} new
        </span>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-16 text-gray-400">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading notifications…</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && notifications.length === 0"
        class="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <p class="text-5xl mb-4">🔔</p>
        <h3 class="text-lg font-semibold text-gray-700 mb-1">No notifications yet</h3>
        <p class="text-gray-400 text-sm">New requests will appear here.</p>
      </div>

      <!-- Notification Cards -->
      <div class="space-y-4">
        <div *ngFor="let n of notifications"
          [class.opacity-60]="n.statusAppointement === 'CONFIRMED' || n.statusAppointement === 'CANCELLED'"
          class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">

          <!-- Top row: unread dot + patient + time -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <span *ngIf="!n.read" class="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
              <span *ngIf="n.read"  class="w-2.5 h-2.5 rounded-full bg-gray-300 mt-1 flex-shrink-0"></span>
              
              <div *ngIf="n.type === 'PRESCRIPTION_RENEWAL'">
                <p class="font-semibold text-gray-900 text-lg">{{n.title || 'Renewal Request'}}</p>
                <p class="text-sm text-blue-600">Medical Prescription</p>
              </div>
              
              <div *ngIf="n.type !== 'PRESCRIPTION_RENEWAL'">
                <p class="font-semibold text-gray-900 text-lg">{{n.patientName}}</p>
                <p class="text-sm text-blue-600">{{n.specialty}}</p>
              </div>
            </div>
            <span class="text-xs text-gray-400">{{formatDate(n.createdDate)}}</span>
          </div>

          <!-- Content (Renewal vs Appointment) -->
          <ng-container *ngIf="n.type === 'PRESCRIPTION_RENEWAL'">
            <p class="text-sm text-gray-700 mb-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span class="font-medium text-gray-500">Details: </span>{{n.message || 'The patient requested a prescription renewal.'}}
            </p>
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                PENDING RENEWAL
              </span>
              <div class="flex gap-3">
                <button (click)="validateRenewal(n)"
                  [disabled]="actionLoading === n.notificationId"
                  class="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50">
                  {{actionLoading === n.notificationId ? '…' : '✅ Valider'}}
                </button>
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="n.type !== 'PRESCRIPTION_RENEWAL'">
            <!-- Schedule info -->
            <div class="flex gap-6 text-sm text-gray-600 mb-3">
              <span *ngIf="n.scheduleDate">📅 {{formatScheduleDate(n.scheduleDate)}}</span>
              <span *ngIf="n.scheduleTime">🕐 {{formatTime(n.scheduleTime)}}</span>
            </div>

            <!-- Reason -->
            <p class="text-sm text-gray-700 mb-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span class="font-medium text-gray-500">Reason: </span>{{n.reasonForVisit}}
            </p>

            <!-- Status badge -->
            <div class="flex items-center justify-between">
              <span [class]="statusClass(n.statusAppointement)"
                class="px-3 py-1 rounded-full text-xs font-semibold">
                {{n.statusAppointement}}
              </span>

              <!-- Accept / Refuse buttons — only for PENDING -->
              <div *ngIf="n.statusAppointement === 'PENDING'" class="flex gap-3">
                <button (click)="refuse(n)"
                  [disabled]="actionLoading === n.notificationId"
                  class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                  {{actionLoading === n.notificationId ? '…' : '❌ Refuse'}}
                </button>
                <button (click)="accept(n)"
                  [disabled]="actionLoading === n.notificationId"
                  class="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50">
                  {{actionLoading === n.notificationId ? '…' : '✅ Accept'}}
                </button>
              </div>

              <!-- Already handled label -->
              <span *ngIf="n.statusAppointement === 'CONFIRMED'"
                class="text-xs text-green-600 font-medium">Accepted ✓</span>
              <span *ngIf="n.statusAppointement === 'CANCELLED'"
                class="text-xs text-red-500 font-medium">Refused ✓</span>
            </div>
          </ng-container>

        </div>
      </div>

      <!-- Error toast -->
      <div *ngIf="errorMsg"
        class="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50">
        ⚠️ {{errorMsg}}
      </div>

      <!-- Success toast -->
      <div *ngIf="successMsg"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50">
        ✅ {{successMsg}}
      </div>
    </div>
  `
})
export class DoctorNotificationsComponent implements OnInit, OnDestroy {

    notifications: NotificationDTO[] = [];
    loading = true;
    actionLoading: number | null = null;
    errorMsg = '';
    successMsg = '';

    private doctorId: number = Number(localStorage.getItem('userId') ?? 0);
    private wsSub?: Subscription;

    get unreadCount(): number {
        return this.notifications.filter(n => !n.read && (n.statusAppointement === 'PENDING' || n.type === 'PRESCRIPTION_RENEWAL')).length;
    }

    constructor(
      private svc: DoctorNotificationService,
      private rxSvc: PrescriptionService
    ) { }

    ngOnInit() {
        this.load();

        // Subscribe to real-time WebSocket and reload when a new notification arrives
        this.svc.subscribeToRealTime(this.doctorId);
        this.wsSub = this.svc.newNotification$
            .pipe(filter(n => n !== null))
            .subscribe(newNotif => {
                // Re-fetch the full list so we get all details (schedule, patient, etc.)
                this.svc.getNotifications(this.doctorId).subscribe({
                    next: data => {
                        this.notifications = data;
                        this.showSuccess(`🔔 New appointment request from ${(newNotif as NotificationDTO).patientName || 'a patient'}!`);
                    }
                });
            });
    }

    ngOnDestroy() {
        this.wsSub?.unsubscribe();
    }

    load() {
        this.loading = true;
        this.svc.getNotifications(this.doctorId).subscribe({
            next: data => { this.notifications = data; this.loading = false; },
            error: () => { this.loading = false; this.showError('Failed to load notifications.'); }
        });
    }

    accept(n: NotificationDTO) {
        this.actionLoading = n.notificationId;
        this.svc.accept(n.notificationId).subscribe({
            next: updated => {
                n.statusAppointement = updated.statusAppointement;
                n.read = true;
                this.actionLoading = null;
                this.showSuccess('Appointment confirmed! The patient will be notified.');
            },
            error: () => { this.actionLoading = null; this.showError('Could not accept appointment.'); }
        });
    }

    refuse(n: NotificationDTO) {
        this.actionLoading = n.notificationId;
        this.svc.refuse(n.notificationId).subscribe({
            next: updated => {
                n.statusAppointement = updated.statusAppointement;
                n.read = true;
                this.actionLoading = null;
                this.showSuccess('Appointment refused. The schedule slot has been freed.');
            },
            error: () => { this.actionLoading = null; this.showError('Could not refuse appointment.'); }
        });
    }

    validateRenewal(n: NotificationDTO) {
        if (!n.prescriptionId) {
            this.showError('Prescription ID is missing!');
            return;
        }
        this.actionLoading = n.notificationId;
        this.rxSvc.updateStatus(n.prescriptionId, 'VALIDATED').subscribe({
            next: () => {
                // Mark associated notification as read
                this.svc.markRead(n.notificationId).subscribe({
                    next: () => {
                        n.read = true;
                        // To physically remove it or keep it, we could filter it out. Let's just remove it.
                        this.notifications = this.notifications.filter(notif => notif.notificationId !== n.notificationId);
                        this.actionLoading = null;
                        this.showSuccess('✅ Renewal validated successfully!');
                    },
                    error: () => {
                        this.actionLoading = null;
                        this.showError('Failed to mark notification as read, but prescription was validated.');
                    }
                });
            },
            error: () => {
                this.actionLoading = null;
                this.showError('Erreur lors de la validation du renouvellement.');
            }
        });
    }

    statusClass(status: string): string {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    }

    formatDate(dt: string): string {
        if (!dt) return '';
        return new Date(dt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    formatScheduleDate(d: string): string {
        if (!d) return '';
        return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    formatTime(t: any): string {
        if (!t) return '';
        if (Array.isArray(t)) return `${String(t[0]).padStart(2, '0')}:${String(t[1]).padStart(2, '0')}`;
        return String(t).substring(0, 5);
    }

    private showSuccess(msg: string) {
        this.successMsg = msg;
        setTimeout(() => this.successMsg = '', 3500);
    }

    private showError(msg: string) {
        this.errorMsg = msg;
        setTimeout(() => this.errorMsg = '', 4000);
    }
}
