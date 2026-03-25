import { Component, OnInit } from '@angular/core';
import { DoctorAppointmentService } from '../../services/doctor-appointment.service';
import { AppointmentResponse, ScheduleSlot } from '../../../patient/services/appointment.service';

@Component({
  selector: 'app-patient-records',
  template: `
    <div class="p-8 max-w-5xl mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Patient Records</h1>
          <p class="text-gray-500 mt-1">Manage and review patient appointments from the database</p>
        </div>
      </div>

      <!-- Filter tabs + search -->
      <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input type="text" [(ngModel)]="search" placeholder="Search by patient name or specialty…"
          class="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        <div class="flex gap-2 flex-wrap">
          <button *ngFor="let f of filters"
            (click)="activeFilter = f.value"
            [class.bg-blue-600]="activeFilter === f.value"
            [class.text-white]="activeFilter === f.value"
            [class.bg-gray-100]="activeFilter !== f.value"
            [class.text-gray-600]="activeFilter !== f.value"
            class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all">
            {{f.label}}
            <span *ngIf="f.value !== 'ALL'"
              class="ml-1 text-xs opacity-70">({{countByStatus(f.value)}})</span>
          </button>
        </div>
      </div>

      <!-- Summary stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-center gap-3">
          <span class="text-2xl">⏳</span>
          <div>
            <p class="text-xs text-yellow-600 font-semibold uppercase tracking-wide">Pending</p>
            <p class="text-2xl font-bold text-yellow-700">{{countByStatus('PENDING')}}</p>
          </div>
        </div>
        <div class="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
          <span class="text-2xl">✅</span>
          <div>
            <p class="text-xs text-green-600 font-semibold uppercase tracking-wide">Confirmed</p>
            <p class="text-2xl font-bold text-green-700">{{countByStatus('CONFIRMED')}}</p>
          </div>
        </div>
        <div class="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
          <span class="text-2xl">❌</span>
          <div>
            <p class="text-xs text-red-600 font-semibold uppercase tracking-wide">Cancelled</p>
            <p class="text-2xl font-bold text-red-700">{{countByStatus('CANCELLED')}}</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-20 text-gray-400">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && filtered.length === 0"
        class="text-center py-20 bg-white rounded-2xl border border-gray-200">
        <p class="text-4xl mb-3">👥</p>
        <h3 class="text-lg font-semibold text-gray-700">No records found</h3>
        <p class="text-gray-400 text-sm">No appointments match the current filter.</p>
      </div>

      <!-- Appointment cards -->
      <div *ngIf="!loading" class="space-y-4">
        <div *ngFor="let apt of filtered"
          class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">

          <div class="flex flex-col md:flex-row md:items-center gap-4">

            <!-- Date badge -->
            <div class="w-14 h-14 bg-blue-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
              <span class="text-[10px] font-extrabold uppercase tracking-wide">{{getMonth(apt.scheduleDate)}}</span>
              <span class="text-xl font-extrabold leading-none">{{getDay(apt.scheduleDate)}}</span>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-lg">👤</span>
                <h3 class="font-bold text-gray-900 text-lg">{{apt.patientName || 'Patient #' + apt.userId}}</h3>
                <span [class]="statusClass(apt.statusAppointement)"
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {{apt.statusAppointement}}
                </span>
              </div>
              <p class="text-blue-600 text-sm font-medium mt-0.5">{{apt.specialty}}</p>
              <div class="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                <span>🕐 {{formatTime(apt.scheduleTime)}}</span>
                <span *ngIf="apt.reasonForVisit">📋 {{apt.reasonForVisit}}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-wrap">

              <button *ngIf="apt.statusAppointement === 'PENDING'"
                (click)="confirm(apt)"
                [disabled]="actionLoading === apt.appointmentId"
                class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                {{actionLoading === apt.appointmentId ? '…' : '✅ Confirm'}}
              </button>

              <button *ngIf="apt.statusAppointement === 'PENDING'"
                (click)="refuse(apt)"
                [disabled]="actionLoading === apt.appointmentId"
                class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                {{actionLoading === apt.appointmentId ? '…' : '❌ Refuse'}}
              </button>

              <button *ngIf="apt.statusAppointement !== 'CANCELLED'"
                (click)="openReschedule(apt)"
                class="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors">
                📅 Reschedule
              </button>

            </div>
          </div>
        </div>
      </div>

      <!-- Reschedule modal -->
      <div *ngIf="rescheduleTarget"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl">
          <h2 class="text-lg font-bold text-gray-900">Reschedule Appointment</h2>
          <p class="text-sm text-gray-500">
            Patient: <span class="font-semibold text-gray-800">{{rescheduleTarget.patientName}}</span>
          </p>

          <div *ngIf="loadingSlots" class="text-center py-6 text-gray-400 text-sm">
            Loading available slots…
          </div>

          <div *ngIf="!loadingSlots && availableSlots.length === 0"
            class="text-center py-4 text-red-500 text-sm">
            No available slots at this time.
          </div>

          <div *ngIf="!loadingSlots && availableSlots.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
            <label *ngFor="let slot of availableSlots"
              class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
              [class.border-blue-500]="selectedSlotId === slot.scheduleId"
              [class.bg-blue-50]="selectedSlotId === slot.scheduleId">
              <input type="radio" name="slot" [value]="slot.scheduleId"
                [(ngModel)]="selectedSlotId" class="accent-blue-600">
              <div>
                <p class="text-sm font-semibold text-gray-800">{{formatDate(slot.date)}}</p>
                <p class="text-xs text-gray-500">{{formatTime(slot.startTime)}}</p>
              </div>
            </label>
          </div>

          <div *ngIf="rescheduleError" class="text-red-600 text-sm">{{rescheduleError}}</div>

          <div class="flex gap-3 justify-end mt-2">
            <button (click)="closeReschedule()"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl text-sm font-semibold hover:bg-gray-200">
              Cancel
            </button>
            <button (click)="confirmReschedule()"
              [disabled]="!selectedSlotId || rescheduleSaving"
              class="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
              {{rescheduleSaving ? 'Saving…' : 'Confirm Reschedule'}}
            </button>
          </div>
        </div>
      </div>

      <!-- Toast success -->
      <div *ngIf="successMsg"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl z-50">
        ✅ {{successMsg}}
      </div>
      <!-- Toast error -->
      <div *ngIf="errorMsg"
        class="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-xl shadow-xl z-50">
        ⚠️ {{errorMsg}}
      </div>

    </div>
  `
})
export class PatientRecordsComponent implements OnInit {

  appointments: AppointmentResponse[] = [];
  loading = true;
  actionLoading: number | null = null;
  search = '';
  successMsg = '';
  errorMsg = '';

  activeFilter: string = 'ALL';
  filters = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  // Reschedule modal
  rescheduleTarget: AppointmentResponse | null = null;
  availableSlots: ScheduleSlot[] = [];
  selectedSlotId: number | null = null;
  loadingSlots = false;
  rescheduleSaving = false;
  rescheduleError = '';

  private doctorId: number = Number(localStorage.getItem('userId') ?? 0);

  constructor(private svc: DoctorAppointmentService) { }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getDoctorAppointments(this.doctorId).subscribe({
      next: data => { this.appointments = data; this.loading = false; },
      error: () => { this.loading = false; this.showError('Failed to load patient appointments.'); }
    });
  }

  get filtered(): AppointmentResponse[] {
    let list = this.appointments;
    if (this.activeFilter !== 'ALL') list = list.filter(a => a.statusAppointement === this.activeFilter);
    if (this.search.trim()) {
      const q = this.search.trim().toLowerCase();
      list = list.filter(a =>
        (a.patientName || '').toLowerCase().includes(q) ||
        (a.specialty || '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  countByStatus(status: string): number {
    return this.appointments.filter(a => a.statusAppointement === status).length;
  }

  confirm(apt: AppointmentResponse) {
    this.actionLoading = apt.appointmentId;
    this.svc.confirm(apt.appointmentId).subscribe({
      next: updated => { apt.statusAppointement = updated.statusAppointement; this.actionLoading = null; this.showSuccess('Appointment confirmed!'); },
      error: () => { this.actionLoading = null; this.showError('Could not confirm appointment.'); }
    });
  }

  refuse(apt: AppointmentResponse) {
    this.actionLoading = apt.appointmentId;
    this.svc.refuse(apt.appointmentId).subscribe({
      next: updated => { apt.statusAppointement = updated.statusAppointement; this.actionLoading = null; this.showSuccess('Appointment refused.'); },
      error: () => { this.actionLoading = null; this.showError('Could not refuse appointment.'); }
    });
  }

  openReschedule(apt: AppointmentResponse) {
    this.rescheduleTarget = apt;
    this.selectedSlotId = null;
    this.rescheduleError = '';
    this.loadingSlots = true;
    this.svc.getAvailableSlots(this.doctorId).subscribe({
      next: slots => { this.availableSlots = slots; this.loadingSlots = false; },
      error: () => { this.loadingSlots = false; }
    });
  }

  closeReschedule() { this.rescheduleTarget = null; this.selectedSlotId = null; }

  confirmReschedule() {
    if (!this.rescheduleTarget || !this.selectedSlotId) return;
    this.rescheduleSaving = true;
    this.rescheduleError = '';
    this.svc.reschedule(this.rescheduleTarget.appointmentId, this.selectedSlotId).subscribe({
      next: updated => {
        const idx = this.appointments.findIndex(a => a.appointmentId === this.rescheduleTarget!.appointmentId);
        if (idx !== -1) this.appointments[idx] = updated;
        this.rescheduleSaving = false;
        this.closeReschedule();
        this.showSuccess('Appointment rescheduled!');
      },
      error: () => { this.rescheduleSaving = false; this.rescheduleError = 'Failed to reschedule. Please try again.'; }
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

  getMonth(d: string): string {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase();
  }

  getDay(d: string): string {
    if (!d) return '';
    return new Date(d + 'T00:00:00').getDate().toString().padStart(2, '0');
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatTime(t: any): string {
    if (!t) return '';
    if (Array.isArray(t)) return `${String(t[0]).padStart(2, '0')}:${String(t[1]).padStart(2, '0')}`;
    return String(t).substring(0, 5);
  }

  private showSuccess(msg: string) { this.successMsg = msg; setTimeout(() => this.successMsg = '', 3500); }
  private showError(msg: string) { this.errorMsg = msg; setTimeout(() => this.errorMsg = '', 4000); }
}
