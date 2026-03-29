import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ScheduleSlot {
  scheduleId: number;
  doctorId: number;
  date: string;
  startTime: any;
  isAvailable: boolean;
}

@Component({
  selector: 'app-manage-schedules',
  template: `
    <div class="p-6 max-w-4xl mx-auto">

      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">📅 Manage My Schedules</h1>
          <p class="text-gray-500 text-sm mt-1">Add and manage your available appointment slots</p>
        </div>
        <button (click)="showForm = !showForm"
          class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2">
          <span>{{showForm ? '✕ Cancel' : '+ Add Slot'}}</span>
        </button>
      </div>

      <!-- Add Slot Form -->
      <div *ngIf="showForm" class="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <h2 class="text-base font-semibold text-blue-900 mb-4">New Schedule Slot</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" [(ngModel)]="newDate" [min]="todayStr"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" [(ngModel)]="newTime"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="flex items-end">
            <button (click)="addSlot()"
              [disabled]="!newDate || !newTime || saving"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              {{saving ? 'Saving…' : '✅ Save Slot'}}
            </button>
          </div>
        </div>
        <p *ngIf="formError" class="text-red-600 text-sm mt-2">{{formError}}</p>
        <p *ngIf="formSuccess" class="text-green-600 text-sm mt-2">{{formSuccess}}</p>
      </div>

      <!-- Stats summary -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-blue-600">{{slots.length}}</p>
          <p class="text-xs text-gray-500 mt-1">Total Slots</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{availableCount}}</p>
          <p class="text-xs text-gray-500 mt-1">Available</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-orange-500">{{bookedCount}}</p>
          <p class="text-xs text-gray-500 mt-1">Booked</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-12 text-gray-400">
        <p class="text-4xl mb-2">⏳</p>
        <p>Loading your schedule…</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && slots.length === 0" class="text-center py-12 bg-white rounded-2xl border border-gray-200">
        <p class="text-5xl mb-3">📭</p>
        <h3 class="text-lg font-semibold text-gray-700">No schedule slots yet</h3>
        <p class="text-gray-400 text-sm mt-1">Click "Add Slot" to create your first available time.</p>
      </div>

      <!-- Slots list grouped by date -->
      <div *ngIf="!loading && slots.length > 0" class="space-y-4">
        <div *ngFor="let group of groupedSlots" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <!-- Date header -->
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
            <span class="text-lg">📆</span>
            <span class="font-semibold text-gray-800">{{formatDate(group.date)}}</span>
            <span class="ml-auto text-xs text-gray-400">{{group.slots.length}} slot(s)</span>
          </div>
          <!-- Slot rows -->
          <div class="divide-y divide-gray-100">
            <div *ngFor="let slot of group.slots"
              class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-3">
                <span class="text-xl">🕐</span>
                <span class="font-medium text-gray-800">{{formatTime(slot.startTime)}}</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                  [class]="slot.isAvailable
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'">
                  {{slot.isAvailable ? 'Available' : 'Booked'}}
                </span>
              </div>
              <button *ngIf="slot.isAvailable" (click)="deleteSlot(slot)"
                class="text-red-500 hover:text-red-700 text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-red-50">
                🗑 Remove
              </button>
              <span *ngIf="!slot.isAvailable" class="text-gray-400 text-xs">Already booked</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ManageSchedulesComponent implements OnInit {
  slots: ScheduleSlot[] = [];
  loading = false;

  showForm = false;
  newDate = '';
  newTime = '';
  saving = false;
  formError = '';
  formSuccess = '';

  todayStr = new Date().toISOString().split('T')[0];

  private readonly base = 'http://localhost:8088';
  get doctorId(): number { return Number(localStorage.getItem('userId') || 0); }

  constructor(private http: HttpClient) {
    if (!this.doctorId) {
      console.warn('doctorId is 0 or invalid. Check localStorage userId.');
    }
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<ScheduleSlot[]>(`${this.base}/api/doctor/schedules/doctor/${this.doctorId}`)
      .subscribe({
        next: data => { this.slots = data; this.loading = false; },
        error: () => { this.loading = false; }
      });
  }

  get availableCount() { return this.slots.filter(s => s.isAvailable).length; }
  get bookedCount() { return this.slots.filter(s => !s.isAvailable).length; }

  get groupedSlots(): { date: string; slots: ScheduleSlot[] }[] {
    const map = new Map<string, ScheduleSlot[]>();
    for (const s of this.slots) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, slots]) => ({ date, slots: slots.sort((x, y) => String(x.startTime).localeCompare(String(y.startTime))) }));
  }

  addSlot() {
    if (!this.newDate || !this.newTime) return;
    this.saving = true;
    this.formError = '';
    this.formSuccess = '';

    const payload = {
      doctorId: this.doctorId,
      date: this.newDate,
      startTime: this.newTime + ':00',
      isAvailable: true
    };

    this.http.post<ScheduleSlot>(`${this.base}/api/doctor/schedules`, payload).subscribe({
      next: (slot) => {
        this.slots.push(slot);
        this.newDate = '';
        this.newTime = '';
        this.saving = false;
        this.formSuccess = '✅ Slot added successfully!';
        setTimeout(() => this.formSuccess = '', 3000);
      },
      error: (err) => {
        this.saving = false;
        console.error('Error saving slot:', err);
        const backendMsg = err.error?.message || err.message || 'Unknown error';
        alert('Server Error: ' + backendMsg);
        this.formError = 'Failed to save slot: ' + backendMsg;
      }
    });
  }

  deleteSlot(slot: ScheduleSlot) {
    if (!confirm(`Remove slot on ${this.formatDate(slot.date)} at ${this.formatTime(slot.startTime)}?`)) return;
    this.http.delete(`${this.base}/api/doctor/schedules/${slot.scheduleId}`).subscribe({
      next: () => { this.slots = this.slots.filter(s => s.scheduleId !== slot.scheduleId); },
      error: () => { alert('Failed to delete slot.'); }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatTime(time: any): string {
    if (!time) return '';
    if (Array.isArray(time)) return `${String(time[0]).padStart(2, '0')}:${String(time[1]).padStart(2, '0')}`;
    return String(time).substring(0, 5);
  }
}
