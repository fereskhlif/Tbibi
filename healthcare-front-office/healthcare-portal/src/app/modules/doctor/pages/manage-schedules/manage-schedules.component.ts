import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DoctorAppointmentService,
  UnavailabilityWindow,
  DoctorExceptionResponse
} from '../../services/doctor-appointment.service';

interface ScheduleSlot {
  scheduleId: number;
  doctorId: number;
  date: string;
  startTime: any;
  isAvailable: boolean;
}

const DAYS_OF_WEEK = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAY_LABELS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

@Component({
  selector: 'app-manage-schedules',
  standalone: false,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div class="max-w-5xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">📅 My Availability</h1>
            <p class="text-gray-500 mt-1">Configure your work schedule and exceptions</p>
          </div>
          <!-- Stats -->
          <div class="flex gap-4">
            <div class="bg-white border border-gray-200 rounded-2xl px-5 py-3 text-center shadow-sm">
              <p class="text-2xl font-bold text-blue-600">{{slots.length}}</p>
              <p class="text-xs text-gray-400 mt-0.5">Total Slots</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-2xl px-5 py-3 text-center shadow-sm">
              <p class="text-2xl font-bold text-emerald-600">{{availableCount}}</p>
              <p class="text-xs text-gray-400 mt-0.5">Available</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-2xl px-5 py-3 text-center shadow-sm">
              <p class="text-2xl font-bold text-orange-500">{{bookedCount}}</p>
              <p class="text-xs text-gray-400 mt-0.5">Booked</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
          <button (click)="activeTab='template'"
            [class]="activeTab==='template'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-gray-500 hover:text-gray-700'"
            class="px-6 py-2.5 rounded-xl text-sm transition-all">
            ⚙️ Work Template
          </button>
          <button (click)="activeTab='exceptions'; loadExceptions()"
            [class]="activeTab==='exceptions'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-gray-500 hover:text-gray-700'"
            class="px-6 py-2.5 rounded-xl text-sm transition-all">
            🚫 Day Exceptions
          </button>
          <button (click)="activeTab='slots'"
            [class]="activeTab==='slots'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-gray-500 hover:text-gray-700'"
            class="px-6 py-2.5 rounded-xl text-sm transition-all">
            🗂 My Slots
          </button>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <!-- TAB 1 — Work Template                                              -->
        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <div *ngIf="activeTab==='template'"
          class="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-8">

          <div>
            <h2 class="text-lg font-bold text-gray-900 mb-1">Weekly Work Template</h2>
            <p class="text-sm text-gray-500">
              Set your working hours and the system will generate all appointment slots
              from today until <strong>December 31, {{currentYear}}</strong>.
            </p>
          </div>

          <!-- Daily work hours + duration -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">🕗 Work Start</label>
              <input type="time" [(ngModel)]="tpl.workStart"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">🕔 Work End</label>
              <input type="time" [(ngModel)]="tpl.workEnd"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">⏱ Consultation (min)</label>
              <input type="number" [(ngModel)]="tpl.consultationMinutes" min="5" max="180" step="5"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
          </div>

          <!-- Rest Days -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">📅 Rest Days (days you don't work)</label>
            <div class="flex flex-wrap gap-2">
              <button *ngFor="let d of allDays; let i = index"
                (click)="toggleRestDay(d)"
                [class]="tpl.restDays.includes(d)
                  ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'"
                class="px-4 py-2 rounded-xl border text-sm font-medium transition-all">
                {{dayLabels[i]}}
              </button>
            </div>
          </div>

          <!-- Unavailability Windows -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              🚫 Recurring Daily Blocks <span class="font-normal text-gray-400">(e.g. lunch, meetings — applies every working day)</span>
            </label>

            <div *ngIf="tpl.unavailableWindows.length === 0"
              class="text-sm text-gray-400 italic mb-3">No recurring blocks. Click below to add one.</div>

            <div class="space-y-2 mb-3">
              <div *ngFor="let w of tpl.unavailableWindows; let i = index"
                class="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
                <span class="text-orange-600 font-semibold text-sm">🚫</span>
                <div class="flex items-center gap-2 flex-1">
                  <input type="time" [(ngModel)]="w.from"
                    class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 w-32">
                  <span class="text-gray-400 font-medium">→</span>
                  <input type="time" [(ngModel)]="w.to"
                    class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 w-32">
                </div>
                <button (click)="removeWindow(i)"
                  class="text-red-400 hover:text-red-600 transition-colors text-lg leading-none">✕</button>
              </div>
            </div>

            <button (click)="addWindow()"
              class="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1 transition-colors">
              <span class="text-lg leading-none">+</span> Add Block
            </button>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2 border-t border-gray-100">
            <button (click)="generateSlots()"
              [disabled]="!canGenerate() || generating"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2">
              <span *ngIf="!generating">🗓 Generate Schedule</span>
              <span *ngIf="generating">⏳ Generating…</span>
            </button>
            <button (click)="clearAndGenerate()"
              [disabled]="!canGenerate() || generating"
              class="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2">
              <span *ngIf="!generating">🔄 Clear & Regenerate</span>
              <span *ngIf="generating">⏳ Working…</span>
            </button>
          </div>

          <!-- Feedback -->
          <p *ngIf="tplError" class="text-red-600 text-sm font-medium">⚠️ {{tplError}}</p>
          <p *ngIf="tplSuccess" class="text-emerald-600 text-sm font-medium">✅ {{tplSuccess}}</p>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <!-- TAB 2 — Day Exceptions                                             -->
        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <div *ngIf="activeTab==='exceptions'"
          class="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-8">

          <div>
            <h2 class="text-lg font-bold text-gray-900 mb-1">Specific Day Exceptions</h2>
            <p class="text-sm text-gray-500">Block a specific date — either the whole day or just certain hours.</p>
          </div>

          <!-- Add Exception Form -->
          <div class="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-5">
            <h3 class="text-sm font-bold text-red-800">Add New Exception</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">📆 Date</label>
                <input type="date" [(ngModel)]="exc.date" [min]="todayStr"
                  class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
              </div>
              <div class="flex items-end">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="exc.wholeDay"
                    class="w-5 h-5 rounded accent-red-600">
                  <div>
                    <p class="text-sm font-semibold text-gray-700">Whole day off</p>
                    <p class="text-xs text-gray-400">Block all time slots for this date</p>
                  </div>
                </label>
              </div>
            </div>

            <div *ngIf="!exc.wholeDay" class="grid grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">From</label>
                <input type="time" [(ngModel)]="exc.fromTime"
                  class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">To</label>
                <input type="time" [(ngModel)]="exc.toTime"
                  class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
              </div>
            </div>

            <button (click)="addException()"
              [disabled]="!canAddException() || excSaving"
              class="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
              {{excSaving ? '⏳ Saving…' : '+ Add Exception'}}
            </button>

            <p *ngIf="excError" class="text-red-700 text-sm">⚠️ {{excError}}</p>
            <p *ngIf="excSuccess" class="text-emerald-600 text-sm">✅ {{excSuccess}}</p>
          </div>

          <!-- Exceptions List -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Saved Exceptions</h3>

            <div *ngIf="excLoading" class="text-gray-400 text-sm">Loading…</div>

            <div *ngIf="!excLoading && exceptions.length === 0"
              class="text-gray-400 text-sm italic">No exceptions set. All working days are fully available.</div>

            <div *ngIf="!excLoading && exceptions.length > 0"
              class="rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
              <div *ngFor="let e of exceptions"
                class="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="bg-red-100 text-red-700 rounded-xl px-3 py-1 text-sm font-bold">
                    {{formatDate(e.date)}}
                  </div>
                  <span class="text-sm text-gray-600">
                    <span *ngIf="e.wholeDay" class="font-semibold text-red-600">🚫 Whole day off</span>
                    <span *ngIf="!e.wholeDay">{{e.fromTime}} → {{e.toTime}} blocked</span>
                  </span>
                </div>
                <button (click)="removeException(e)"
                  class="text-red-400 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  🗑 Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <!-- TAB 3 — My Slots                                                   -->
        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <div *ngIf="activeTab==='slots'">

          <div *ngIf="loading" class="text-center py-16 text-gray-400">
            <p class="text-4xl mb-2">⏳</p><p>Loading your slots…</p>
          </div>

          <div *ngIf="!loading && slots.length === 0"
            class="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <p class="text-5xl mb-4">📭</p>
            <h3 class="text-xl font-bold text-gray-700 mb-2">No schedule slots yet</h3>
            <p class="text-gray-400 text-sm">Go to <strong>Work Template</strong> tab and click "Generate Schedule".</p>
          </div>

          <div *ngIf="!loading && slots.length > 0" class="space-y-4">
            <div *ngFor="let group of groupedSlots"
              class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-lg">📆</span>
                  <span class="font-bold text-gray-800">{{formatDate(group.date)}}</span>
                  <span class="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200 ml-2">
                    {{group.slots.length}} slot(s) · {{group.availableCount}} available
                  </span>
                </div>
                <!-- Delete all available slots for this date -->
                <button
                  *ngIf="group.availableCount > 0"
                  (click)="clearAvailableSlotsByDate(group.date)"
                  class="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center gap-1">
                  🗑 Delete available
                </button>
              </div>
              <div class="flex flex-wrap gap-2 p-4">
                <div *ngFor="let slot of group.slots"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border"
                  [class]="slot.isAvailable
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-orange-50 border-orange-200 text-orange-700'">
                  <span class="font-semibold">{{formatTime(slot.startTime)}}</span>
                  <span class="text-xs opacity-70">{{slot.isAvailable ? '✓' : 'Booked'}}</span>
                  <button *ngIf="slot.isAvailable" (click)="deleteSlot(slot)"
                    class="text-red-400 hover:text-red-600 text-xs ml-1 transition-colors">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ManageSchedulesComponent implements OnInit {

  activeTab: 'template' | 'exceptions' | 'slots' = 'template';
  currentYear = new Date().getFullYear();
  todayStr = new Date().toISOString().split('T')[0];

  // ─── Slots list ────────────────────────────────────────────────────────────
  slots: ScheduleSlot[] = [];
  loading = false;

  // ─── Template form ─────────────────────────────────────────────────────────
  tpl = {
    workStart: '08:00',
    workEnd: '16:00',
    consultationMinutes: 30,
    restDays: [] as string[],
    unavailableWindows: [] as UnavailabilityWindow[]
  };
  generating = false;
  tplError = '';
  tplSuccess = '';

  allDays = DAYS_OF_WEEK;
  dayLabels = DAY_LABELS;

  // ─── Exception form ────────────────────────────────────────────────────────
  exc = { date: '', wholeDay: false, fromTime: '', toTime: '' };
  excSaving = false;
  excError = '';
  excSuccess = '';
  excLoading = false;
  exceptions: DoctorExceptionResponse[] = [];

  private readonly base = 'http://localhost:8088';
  get doctorId(): number { return Number(localStorage.getItem('userId') || 0); }

  constructor(
    private http: HttpClient,
    private svc: DoctorAppointmentService
  ) {}

  ngOnInit() { this.loadSlots(); }

  // ─── Slots ─────────────────────────────────────────────────────────────────

  loadSlots() {
    this.loading = true;
    this.http.get<ScheduleSlot[]>(`${this.base}/api/doctor/schedules/doctor/${this.doctorId}`)
      .subscribe({
        next: d => { this.slots = d; this.loading = false; },
        error: () => this.loading = false
      });
  }

  get availableCount() { return this.slots.filter(s => s.isAvailable).length; }
  get bookedCount()    { return this.slots.filter(s => !s.isAvailable).length; }

  get groupedSlots(): { date: string; slots: ScheduleSlot[]; availableCount: number }[] {
    const map = new Map<string, ScheduleSlot[]>();
    for (const s of this.slots) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, slots]) => ({
        date,
        slots: slots.sort((x, y) => String(x.startTime).localeCompare(String(y.startTime))),
        availableCount: slots.filter(s => s.isAvailable).length
      }));
  }

  deleteSlot(slot: ScheduleSlot) {
    if (!confirm(`Remove slot on ${this.formatDate(slot.date)} at ${this.formatTime(slot.startTime)}?`)) return;
    this.http.delete(`${this.base}/api/doctor/schedules/${slot.scheduleId}`).subscribe({
      next: () => { this.slots = this.slots.filter(s => s.scheduleId !== slot.scheduleId); },
      error: () => alert('Failed to delete slot.')
    });
  }

  clearAvailableSlotsByDate(date: string) {
    if (!confirm(`Are you sure you want to delete all available (unbooked) slots for ${this.formatDate(date)}?`)) return;
    this.svc.clearAvailableSlotsByDate(this.doctorId, date).subscribe({
      next: () => {
        // Filter out all slots that are on this date AND are available
        this.slots = this.slots.filter(s => !(s.date === date && s.isAvailable));
      },
      error: (err) => alert(err?.error?.message || 'Failed to delete slots for this date.')
    });
  }

  // ─── Template ──────────────────────────────────────────────────────────────

  toggleRestDay(day: string) {
    const idx = this.tpl.restDays.indexOf(day);
    idx === -1 ? this.tpl.restDays.push(day) : this.tpl.restDays.splice(idx, 1);
  }

  addWindow() {
    this.tpl.unavailableWindows.push({ from: '12:00', to: '13:00' });
  }

  removeWindow(i: number) {
    this.tpl.unavailableWindows.splice(i, 1);
  }

  canGenerate(): boolean {
    return !!(this.tpl.workStart && this.tpl.workEnd && this.tpl.consultationMinutes > 0);
  }

  generateSlots() {
    if (!this.canGenerate()) return;
    this.generating = true;
    this.tplError = '';
    this.tplSuccess = '';

    this.svc.generateSlots({
      doctorId: this.doctorId,
      ...this.tpl
    }).subscribe({
      next: (newSlots) => {
        this.slots.push(...(newSlots as any));
        this.generating = false;
        this.tplSuccess = `✅ ${newSlots.length} slots generated successfully until Dec 31, ${this.currentYear}!`;
        this.activeTab = 'slots';
        this.loadSlots();
        setTimeout(() => this.tplSuccess = '', 5000);
      },
      error: (err) => {
        this.generating = false;
        this.tplError = err?.error?.message || 'Failed to generate slots. Please try again.';
      }
    });
  }

  clearAndGenerate() {
    if (!this.canGenerate()) return;
    if (!confirm('This will delete all your unbooked slots and regenerate them. Continue?')) return;
    this.generating = true;
    this.tplError = '';
    this.tplSuccess = '';

    this.svc.clearAvailableSlots(this.doctorId).subscribe({
      next: () => {
        this.svc.generateSlots({ doctorId: this.doctorId, ...this.tpl }).subscribe({
          next: (newSlots) => {
            this.generating = false;
            this.tplSuccess = `✅ Cleared and regenerated ${newSlots.length} slots until Dec 31, ${this.currentYear}!`;
            this.activeTab = 'slots';
            this.loadSlots();
            setTimeout(() => this.tplSuccess = '', 5000);
          },
          error: (err) => {
            this.generating = false;
            this.tplError = err?.error?.message || 'Failed to regenerate slots.';
          }
        });
      },
      error: (err) => {
        this.generating = false;
        this.tplError = err?.error?.message || 'Failed to clear old slots.';
      }
    });
  }

  // ─── Exceptions ────────────────────────────────────────────────────────────

  loadExceptions() {
    this.excLoading = true;
    this.svc.getExceptions(this.doctorId).subscribe({
      next: d => { this.exceptions = d; this.excLoading = false; },
      error: () => this.excLoading = false
    });
  }

  canAddException(): boolean {
    if (!this.exc.date) return false;
    if (!this.exc.wholeDay && (!this.exc.fromTime || !this.exc.toTime)) return false;
    return true;
  }

  addException() {
    if (!this.canAddException()) return;
    this.excSaving = true;
    this.excError = '';
    this.excSuccess = '';

    this.svc.addException({
      doctorId: this.doctorId,
      date: this.exc.date,
      fromTime: this.exc.wholeDay ? undefined : this.exc.fromTime,
      toTime:   this.exc.wholeDay ? undefined : this.exc.toTime
    }).subscribe({
      next: (e) => {
        this.exceptions.unshift(e);
        this.excSaving = false;
        this.excSuccess = `Exception added for ${this.formatDate(this.exc.date)}.`;
        this.exc = { date: '', wholeDay: false, fromTime: '', toTime: '' };
        this.loadSlots();
        setTimeout(() => this.excSuccess = '', 4000);
      },
      error: (err) => {
        this.excSaving = false;
        this.excError = err?.error?.message || 'Failed to save exception.';
      }
    });
  }

  removeException(e: DoctorExceptionResponse) {
    if (!confirm(`Remove exception for ${this.formatDate(e.date)}? Affected time slots will become available again.`)) return;
    this.svc.deleteException(e.id).subscribe({
      next: () => {
        this.exceptions = this.exceptions.filter(x => x.id !== e.id);
        this.loadSlots();
      },
      error: () => alert('Failed to remove exception.')
    });
  }

  // ─── Formatters ────────────────────────────────────────────────────────────

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  formatTime(time: any): string {
    if (!time) return '';
    if (Array.isArray(time)) return `${String(time[0]).padStart(2,'0')}:${String(time[1]).padStart(2,'0')}`;
    return String(time).substring(0, 5);
  }
}
