import { Component, OnInit } from '@angular/core';
import { DoctorAppointmentService } from '../../services/doctor-appointment.service';
import { AppointmentResponse, ScheduleSlot } from '../../../patient/services/appointment.service';

@Component({
    selector: 'app-doctor-all-appointments',
    template: `
    <div class="p-8 max-w-5xl mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">All Patient Appointments</h1>
          <p class="text-gray-500 mt-1">View, confirm, refuse or reschedule appointments from patients</p>
        </div>
        <div class="flex gap-3">
          <!-- Search input -->
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
            <input type="text" [(ngModel)]="activeSearch" placeholder="Search patient..."
                   class="pl-10 pr-4 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all">
          </div>
          <button *ngFor="let f of filters"
            (click)="activeFilter = f.value"
            [class.bg-blue-600]="activeFilter === f.value"
            [class.text-white]="activeFilter === f.value"
            [class.bg-gray-100]="activeFilter !== f.value"
            [class.text-gray-600]="activeFilter !== f.value"
            class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all">
            {{f.label}}
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
        <p class="text-4xl mb-3">📅</p>
        <h3 class="text-lg font-semibold text-gray-700">No appointments found</h3>
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
                <h3 class="font-bold text-gray-900 text-lg">{{apt.patientName || 'Patient #' + apt.userId}}</h3>
                <span [class]="statusClass(apt.statusAppointement)"
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {{apt.statusAppointement}}
                </span>
              </div>
              <p class="text-blue-600 text-sm font-medium">{{apt.specialty}}</p>
              <div class="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                <span>🕐 {{formatTime(apt.scheduleTime)}}</span>
                <span *ngIf="apt.reasonForVisit">📋 {{apt.reasonForVisit}}</span>
                <button *ngIf="apt.meetingLink" (click)="openMeeting(apt.meetingLink, $event)" class="text-blue-500 hover:text-blue-700 underline font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none p-0">
                  🔗 Join Meeting
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-wrap">

              <!-- Confirm button — only if PENDING -->
              <button *ngIf="apt.statusAppointement === 'PENDING'"
                (click)="confirm(apt)"
                [disabled]="actionLoading === apt.appointmentId"
                class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                {{actionLoading === apt.appointmentId ? '…' : '✅ Confirm'}}
              </button>

              <!-- Refuse button — only if PENDING -->
              <button *ngIf="apt.statusAppointement === 'PENDING'"
                (click)="refuse(apt)"
                [disabled]="actionLoading === apt.appointmentId"
                class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                {{actionLoading === apt.appointmentId ? '…' : '❌ Refuse'}}
              </button>

              <!-- Reschedule button — always available unless cancelled -->
              <button *ngIf="apt.statusAppointement !== 'CANCELLED'"
                (click)="openReschedule(apt)"
                class="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors">
                📅 Reschedule
              </button>

              <!-- Delete button -->
              <button (click)="deleteApt(apt)"
                [disabled]="actionLoading === apt.appointmentId"
                class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                {{actionLoading === apt.appointmentId ? '…' : '🗑️ Delete'}}
              </button>

            </div>
          </div>
        </div>
      </div>

      <!-- Reschedule modal -->
      <div *ngIf="rescheduleTarget"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl">
          <h2 class="text-lg font-bold text-gray-900">📅 Reschedule Appointment</h2>
          <p class="text-sm text-gray-500">
            Patient: <span class="font-semibold text-gray-800">{{rescheduleTarget.patientName}}</span>
          </p>

          <!-- Date picker -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Date</label>
            <input type="date" [(ngModel)]="rescheduleDate"
              [min]="todayStr"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <!-- Time picker -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Time</label>
            <input type="time" [(ngModel)]="rescheduleTime"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <div *ngIf="rescheduleError" class="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{{rescheduleError}}</div>

          <div class="flex gap-3 justify-end mt-2">
            <button (click)="closeReschedule()"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl text-sm font-semibold hover:bg-gray-200">
              Cancel
            </button>
            <button (click)="confirmReschedule()"
              [disabled]="!rescheduleDate || !rescheduleTime || rescheduleSaving"
              class="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
              {{rescheduleSaving ? 'Saving…' : 'Confirm Reschedule'}}
            </button>
          </div>
        </div>
      </div>


      <!-- Toast success -->
      <div *ngIf="successMsg"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2">
        ✅ {{successMsg}}
      </div>

      <!-- Toast error -->
      <div *ngIf="errorMsg"
        class="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2">
        ⚠️ {{errorMsg}}
      </div>

    </div>
  `
})
export class DoctorAllAppointmentsComponent implements OnInit {

    appointments: AppointmentResponse[] = [];
    loading = true;
    actionLoading: number | null = null;
    successMsg = '';
    errorMsg = '';

    activeFilter: string = 'ALL';
    activeSearch: string = '';
    filters = [
        { label: 'All', value: 'ALL' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Confirmed', value: 'CONFIRMED' },
        { label: 'Cancelled', value: 'CANCELLED' },
    ];

    // Reschedule modal state
    rescheduleTarget: AppointmentResponse | null = null;
    availableSlots: ScheduleSlot[] = [];
    selectedSlotId: number | null = null;
    loadingSlots = false;
    rescheduleSaving = false;
    rescheduleError = '';
    rescheduleDate = '';
    rescheduleTime = '';
    todayStr = new Date().toISOString().split('T')[0];

    private doctorId: number = Number(localStorage.getItem('userId') ?? 0);

    constructor(private svc: DoctorAppointmentService) { }

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.svc.getDoctorAppointments(this.doctorId).subscribe({
            next: data => { this.appointments = data; this.loading = false; },
            error: () => { this.loading = false; this.showError('Failed to load appointments.'); }
        });
    }

    get filtered(): AppointmentResponse[] {
        let result = this.appointments;
        
        if (this.activeFilter !== 'ALL') {
            result = result.filter(a => a.statusAppointement === this.activeFilter);
        }
        
        if (this.activeSearch.trim()) {
            const search = this.activeSearch.toLowerCase().trim();
            result = result.filter(a => 
                (a.patientName && a.patientName.toLowerCase().includes(search)) || 
                (!a.patientName && ('Patient #' + a.userId).toLowerCase().includes(search))
            );
        }
        
        return result;
    }

    countByStatus(status: string): number {
        return this.appointments.filter(a => a.statusAppointement === status).length;
    }

    confirm(apt: AppointmentResponse) {
        this.actionLoading = apt.appointmentId;
        this.svc.confirm(apt.appointmentId).subscribe({
            next: updated => {
                apt.statusAppointement = updated.statusAppointement;
                this.actionLoading = null;
                this.showSuccess('Appointment confirmed!');
            },
            error: () => { this.actionLoading = null; this.showError('Could not confirm appointment.'); }
        });
    }

    refuse(apt: AppointmentResponse) {
        this.actionLoading = apt.appointmentId;
        this.svc.refuse(apt.appointmentId).subscribe({
            next: updated => {
                apt.statusAppointement = updated.statusAppointement;
                this.actionLoading = null;
                this.showSuccess('Appointment refused. Slot is now free.');
            },
            error: () => { this.actionLoading = null; this.showError('Could not refuse appointment.'); }
        });
    }

    deleteApt(apt: AppointmentResponse) {
        if (!confirm('Are you sure you want to delete this appointment entirely? This cannot be undone.')) return;
        
        this.actionLoading = apt.appointmentId;
        this.svc.delete(apt.appointmentId).subscribe({
            next: () => {
                this.appointments = this.appointments.filter(a => a.appointmentId !== apt.appointmentId);
                this.actionLoading = null;
                this.showSuccess('Appointment deleted successfully!');
            },
            error: () => { this.actionLoading = null; this.showError('Could not delete appointment.'); }
        });
    }

    openReschedule(apt: AppointmentResponse) {
        this.rescheduleTarget = apt;
        this.rescheduleDate = '';
        this.rescheduleTime = '';
        this.rescheduleError = '';
        this.rescheduleSaving = false;
    }

    closeReschedule() {
        this.rescheduleTarget = null;
        this.selectedSlotId = null;
    }

    confirmReschedule() {
        if (!this.rescheduleTarget || !this.rescheduleDate || !this.rescheduleTime) return;
        this.rescheduleSaving = true;
        this.rescheduleError = '';

        // Step 1: Create a new schedule slot for this doctor
        const slotPayload = {
            doctorId: this.doctorId,
            date: this.rescheduleDate,
            startTime: this.rescheduleTime + ':00',
            isAvailable: false
        };

        this.svc.createScheduleSlot(slotPayload).subscribe({
            next: (newSlot: any) => {
                // Step 2: Reschedule the appointment to this new slot
                this.svc.reschedule(this.rescheduleTarget!.appointmentId, newSlot.scheduleId).subscribe({
                    next: updated => {
                        const idx = this.appointments.findIndex(a => a.appointmentId === this.rescheduleTarget!.appointmentId);
                        if (idx !== -1) this.appointments[idx] = updated;
                        this.rescheduleSaving = false;
                        this.closeReschedule();
                        this.showSuccess('Appointment rescheduled to ' + this.rescheduleDate + ' at ' + this.rescheduleTime + '!');
                    },
                    error: () => {
                        this.rescheduleSaving = false;
                        this.rescheduleError = 'Failed to move appointment to the new slot. Please try again.';
                    }
                });
            },
            error: () => {
                this.rescheduleSaving = false;
                this.rescheduleError = 'Failed to create schedule slot. Please try again.';
            }
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    statusClass(status: string): string {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    }

    getMonth(dateStr: string): string {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase();
    }

    getDay(dateStr: string): string {
        if (!dateStr) return '';
        return new Date(dateStr + 'T00:00:00').getDate().toString().padStart(2, '0');
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
            weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    formatTime(time: any): string {
        if (!time) return '';
        if (Array.isArray(time)) return `${String(time[0]).padStart(2, '0')}:${String(time[1]).padStart(2, '0')}`;
        return String(time).substring(0, 5);
    }

    openMeeting(url: string | undefined, event: Event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (!url) return;
        
        let finalUrl = url.trim();
        // If it looks like a relative file or an email, we might want to let it be,
        // but assume for "Join Meeting", it's an http/https link.
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }
        
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
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
