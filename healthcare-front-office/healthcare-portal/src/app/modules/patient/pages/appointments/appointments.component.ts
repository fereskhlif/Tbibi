import { Component, OnInit } from '@angular/core';
import {
  AppointmentService,
  Doctor,
  ScheduleSlot,
  AppointmentResponse
} from '../../services/appointment.service';

@Component({
  selector: 'app-appointments',
  template: `
    <div class="p-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Appointments</h1>
          <p class="text-gray-600">Manage your upcoming and past appointments</p>
        </div>
        <button (click)="openNewModal()"
          class="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + New Appointment
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 class="text-blue-900 font-semibold mb-2">Upcoming</h3>
          <p class="text-3xl font-bold text-blue-600">{{upcomingAppointments.length}}</p>
        </div>
        <div class="bg-purple-50 p-6 rounded-xl border border-purple-100">
          <h3 class="text-purple-900 font-semibold mb-2">Total Booked</h3>
          <p class="text-3xl font-bold text-purple-600">{{myAppointments.length}}</p>
        </div>
        <div class="bg-green-50 p-6 rounded-xl border border-green-100">
          <h3 class="text-green-900 font-semibold mb-2">Next Visit</h3>
          <p class="text-lg font-bold text-green-600" *ngIf="nextVisit">{{nextVisit}}</p>
          <p class="text-lg font-bold text-green-600" *ngIf="!nextVisit">None scheduled</p>
        </div>
      </div>

      <!-- Load error -->
      <div *ngIf="loadError && !loadingList" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        ⚠️ {{loadError}}
      </div>

      <!-- Loading state -->
      <div *ngIf="loadingList" class="text-center py-12 text-gray-400">
        <p>Loading appointments…</p>
      </div>

      <!-- Appointments List -->
      <div *ngIf="!loadingList" class="bg-white rounded-xl border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">My Appointments</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <div *ngFor="let apt of myAppointments"
            class="p-6 hover:bg-gray-50 transition-all hover:shadow-md flex flex-col gap-4">

            <!-- Reschedule Alert -->
            <div *ngIf="apt.statusAppointement === 'RESCHEDULED_PENDING'"
              class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
              <div class="flex items-center gap-3">
                <span class="text-2xl">⚠️</span>
                <div>
                  <h4 class="font-bold text-amber-900">Dr. {{apt.doctor}} a proposé un nouvel horaire</h4>
                  <p class="text-sm text-amber-800">Veuillez accepter cet horaire ou choisir un autre créneau.</p>
                </div>
              </div>
              <div class="flex gap-2 w-full md:w-auto">
                <button (click)="acceptReschedule(apt)"
                  [disabled]="actionLoading === apt.appointmentId"
                  class="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                  ✅ Accepter
                </button>
                <button (click)="startChooseNewSlot(apt)"
                  [disabled]="actionLoading === apt.appointmentId"
                  class="flex-1 md:flex-none px-4 py-2 bg-amber-600 text-black rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50">
                  🔄 Autre créneau
                </button>
              </div>
            </div>

            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <!-- Date block -->
            <div class="flex items-start gap-4">
              <!-- Left: Date badge + info -->
              <div class="w-14 h-14 bg-blue-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
                <span class="text-xs font-bold uppercase">{{ getMonth(apt.scheduleDate) }}</span>
                <span class="text-xl font-extrabold">{{ getDay(apt.scheduleDate) }}</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg">{{apt.doctor}}</h3>
                <p class="text-gray-600">{{apt.specialty}}</p>
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>🕐 {{formatTime(apt.scheduleTime)}}</span>
                  <span>📋 {{apt.reasonForVisit}}</span>
                </div>
              </div>
            </div>

            <!-- Status + Actions -->
            <div class="flex items-center gap-2 flex-wrap">
              <span [class]="statusClass(apt.statusAppointement)"
                class="px-3 py-1 rounded-full text-sm font-medium">
                {{apt.statusAppointement}}
              </span>
              <button (click)="viewDetails(apt)"
                class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                Details
              </button>
              <button (click)="openEditModal(apt)"
                *ngIf="apt.statusAppointement !== 'CANCELLED'"
                class="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors">
                ✏️ Edit
              </button>
              <button (click)="cancelApt(apt)"
                *ngIf="apt.statusAppointement === 'PENDING'"
                [disabled]="actionLoading === apt.appointmentId"
                class="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors disabled:opacity-50">
                {{actionLoading === apt.appointmentId ? '...' : '🚫 Cancel'}}
              </button>
              <button (click)="deleteApt(apt)"
                [disabled]="actionLoading === apt.appointmentId"
                class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50">
                {{actionLoading === apt.appointmentId ? '...' : '🗑️ Delete'}}
              </button>
            </div>
            </div>
          </div>

          <div *ngIf="myAppointments.length === 0" class="p-8 text-center text-gray-500">
            No appointments yet. Click <strong>+ New Appointment</strong> to book one.
          </div>
        </div>
      </div>
      <!-- Edit modal -->
      <div *ngIf="showEditModal && editTarget"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
          <h2 class="text-lg font-bold text-gray-900">Edit Appointment</h2>

          <label class="block">
            <span class="text-sm text-gray-600 font-medium">Reason for visit</span>
            <textarea [(ngModel)]="editReason" rows="3"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
          </label>

          <label class="block">
            <span class="text-sm text-gray-600 font-medium">Status</span>
            <select [(ngModel)]="editStatus"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </label>

          <div *ngIf="editError" class="text-red-600 text-sm">{{editError}}</div>

          <div class="flex gap-3 justify-end mt-2">
            <button (click)="showEditModal = false"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
              Cancel
            </button>
            <button (click)="saveEdit()"
              [disabled]="editSaving"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
              {{editSaving ? 'Saving…' : 'Save Changes'}}
            </button>
          </div>
        </div>
      </div>


      <div *ngIf="showNewModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

          <!-- Modal header -->
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 class="font-bold text-xl text-gray-900">Book New Appointment</h3>
              <p class="text-sm text-gray-500 mt-0.5">Step {{step}} of 4</p>
            </div>
            <button (click)="closeNewModal()" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <!-- Step progress bar -->
          <div class="flex h-1.5 bg-gray-100">
            <div class="bg-blue-500 transition-all duration-300"
              [style.width.%]="(step / 4) * 100"></div>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5 overflow-y-auto">

            <!-- STEP 1 — Specialty -->
            <div *ngIf="step === 1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                1. Choose a Specialty
              </label>
              <div *ngIf="loadingSpecialties" class="text-gray-400 text-sm">Loading specialties…</div>
              <select *ngIf="!loadingSpecialties"
                [(ngModel)]="selectedSpecialty"
                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 outline-none bg-white">
                <option value="">-- Select a specialty --</option>
                <option *ngFor="let s of specialties" [value]="s">{{s}}</option>
              </select>
              <p *ngIf="specialties.length === 0 && !loadingSpecialties"
                class="text-sm text-red-500 mt-2">
                No specialties found. Make sure the backend is running.
              </p>
            </div>

            <!-- STEP 2 — Doctor -->
            <div *ngIf="step === 2">
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Specialty
              </label>
              <p class="text-blue-600 font-medium mb-4">{{selectedSpecialty}}</p>

              <label class="block text-sm font-semibold text-gray-700 mb-2">
                2. Choose a Doctor
              </label>
              <div *ngIf="loadingDoctors" class="text-gray-400 text-sm">Loading doctors…</div>
              <select *ngIf="!loadingDoctors"
                [(ngModel)]="selectedDoctorId"
                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 outline-none bg-white">
                <option value="">-- Select a doctor --</option>
                <option *ngFor="let d of doctors" [value]="d.userId">
                  Dr. {{d.name}}
                </option>
              </select>
              <p *ngIf="doctors.length === 0 && !loadingDoctors"
                class="text-sm text-red-500 mt-2">
                No doctors found for this specialty.
              </p>
            </div>

            <!-- STEP 3 — Reason for Visit -->
            <div *ngIf="step === 3">
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Doctor
              </label>
              <p class="text-blue-600 font-medium mb-4">{{selectedDoctorName}}</p>

              <label class="block text-sm font-semibold text-gray-700 mb-2">
                3. Reason for Visit
              </label>
              <textarea
                [(ngModel)]="reasonForVisit"
                rows="4"
                placeholder="Briefly describe your symptoms or purpose of visit…"
                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 outline-none resize-none">
              </textarea>
            </div>

            <!-- STEP 4 — Schedule Slot Picker (Calendar Style) -->
            <div *ngIf="step === 4">
              <h4 class="text-center font-bold text-gray-800 text-lg mb-6">
                Veuillez choisir la date du rendez-vous
              </h4>

              <div *ngIf="loadingSchedules" class="flex justify-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>

              <div *ngIf="!loadingSchedules && (scheduleSlots.length === 0 || scheduleError)"
                class="text-center py-10 px-4 text-red-500 bg-red-50 rounded-xl border border-red-100">
                <p class="font-bold mb-2">Aucun créneau disponible pour ce médecin.</p>
                <p class="text-sm text-gray-600 mb-4">
                  {{scheduleError || "Il est possible que tous les créneaux soient déjà réservés ou que le médecin n'ait pas d'horaires configurés."}}
                </p>
                <button (click)="loadSchedules()" class="text-blue-600 font-semibold text-sm hover:underline">
                  Réessayer
                </button>
              </div>

              <div *ngIf="!loadingSchedules && scheduleSlots.length > 0" class="space-y-6 ">
                <!-- Date Header -->
                <div class="flex items-center justify-between px-2">
                  <span class="font-bold text-gray-700 text-base">{{getCurrentMonthYear()}}</span>
                  <div class="flex gap-2">
                    <button
                      (click)="prevDatePage()"
                      [disabled]="datePageStartIndex === 0"
                      class="px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
                      [class.bg-white]="datePageStartIndex > 0"
                      [class.text-gray-700]="datePageStartIndex > 0"
                      [class.hover:bg-gray-50]="datePageStartIndex > 0"
                      [class.bg-gray-100]="datePageStartIndex === 0"
                      [class.text-gray-400]="datePageStartIndex === 0"
                      [class.opacity-50]="datePageStartIndex === 0">
                      &larr; Précédent
                    </button>
                    <button
                      (click)="nextDatePage()"
                      class="px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-50">
                      Suivant &rarr;
                    </button>
                  </div>
                </div>

                <!-- Horizontal Date Picker -->
                <div class="flex gap-1.5 w-full">
                  <button *ngFor="let day of visibleDays"
                    (click)="day.hasSlots ? selectDate(day.date) : null"
                    [disabled]="!day.hasSlots"
                    [class.bg-blue-600]="selectedDate === day.date && day.hasSlots"
                    [class.text-white]="selectedDate === day.date && day.hasSlots"
                    [class.border-blue-600]="selectedDate === day.date && day.hasSlots"
                    [class.shadow-md]="selectedDate === day.date && day.hasSlots"
                    [class.bg-white]="selectedDate !== day.date || !day.hasSlots"
                    [class.text-gray-800]="selectedDate !== day.date && day.hasSlots"
                    [class.text-gray-300]="!day.hasSlots"
                    [class.border-gray-200]="selectedDate !== day.date"
                    [class.cursor-not-allowed]="!day.hasSlots"
                    class="flex-1 py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center hover:border-blue-300 min-w-0">
                    <span class="text-[10px] font-medium uppercase mb-0.5">{{getDayName(day.date)}}</span>
                    <span class="text-lg font-bold">{{getDay(day.date)}}</span>
                    <span class="text-[10px] font-medium uppercase mt-0.5">{{getMonth(day.date)}}</span>
                  </button>
                </div>

                <!-- Time Grid Header -->
                <h4 class="text-center font-bold text-gray-800 text-lg py-2">
                  Veuillez choisir l'heure du rendez-vous
                </h4>

                <!-- Time Grid -->
                <div *ngFor="let day of visibleDays">
                  <div *ngIf="selectedDate === day.date && day.hasSlots">
                    <div class="grid grid-cols-1 gap-3">
                      <button *ngFor="let slot of getVisibleSlots(day.slots)"
                        (click)="selectSlot(slot)"
                        [class.bg-blue-600]="selectedSlot?.scheduleId === slot.scheduleId"
                        [class.text-white]="selectedSlot?.scheduleId === slot.scheduleId"
                        [class.border-blue-600]="selectedSlot?.scheduleId === slot.scheduleId"
                        [class.bg-white]="selectedSlot?.scheduleId !== slot.scheduleId"
                        [class.text-gray-900]="selectedSlot?.scheduleId !== slot.scheduleId"
                        [class.border-gray-200]="selectedSlot?.scheduleId !== slot.scheduleId"
                        class="py-3 px-1 rounded-lg text-sm font-semibold transition-all hover:bg-gray-50 hover:shadow-sm border flex items-center justify-center">
                        {{formatTime(slot.startTime)}}
                      </button>
                    </div>

                    <div *ngIf="day.slots.length > 4" class="text-center mt-4">
                      <button (click)="showAllSlotsForDate = !showAllSlotsForDate" class="text-blue-600 font-medium text-sm hover:underline">
                        {{showAllSlotsForDate ? "Voir moins d'horaires" : "Voir plus d'horaires"}}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected slot summary -->
              <div *ngIf="selectedSlot"
                class="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3 animate-in fade-in duration-300">
                <div class="bg-blue-600 p-2 rounded-lg text-white">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <p class="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Créneau sélectionné</p>
                  <p class="text-blue-900 font-bold">
                    {{formatDate(selectedSlot.date)}} à {{formatTime(selectedSlot.startTime)}}
                  </p>
                </div>
              </div>
            </div>

            <!-- Error message -->
            <p *ngIf="bookingError" class="text-sm text-red-600 font-medium">
              ⚠️ {{bookingError}}
            </p>
          </div>

          <!-- Footer navigation -->
          <div class="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <button *ngIf="step > 1"
              (click)="prevStep()"
              class="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
              ← Back
            </button>
            <span *ngIf="step === 1"></span>

            <div class="flex gap-3">
              <button (click)="closeNewModal()"
                class="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>

              <button *ngIf="step < 4"
                (click)="nextStep()"
                [disabled]="!canProceed()"
                class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Next →
              </button>

              <button *ngIf="step === 4"
                (click)="bookAppointment()"
                [disabled]="!selectedSlot || booking"
                class="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{booking ? 'Booking…' : 'Confirm Booking'}}
              </button>
            </div>
          </div>
        </div>
      </div>


      <!-- ===== APPOINTMENT DETAILS MODAL ===== -->
      <div *ngIf="selectedAppointment"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 class="font-bold text-xl text-gray-900">Appointment Details</h3>
            <button (click)="selectedAppointment = null" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <p class="text-sm text-gray-500">Doctor</p>
              <p class="font-semibold text-gray-900 text-lg">{{selectedAppointment.doctor}}</p>
              <p class="text-blue-600 text-sm">{{selectedAppointment.specialty}}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Date</p>
                <p class="font-medium">{{formatDate(selectedAppointment.scheduleDate)}}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Time</p>
                <p class="font-medium">{{formatTime(selectedAppointment.scheduleTime)}}</p>
              </div>
            </div>
            <div>
              <p class="text-sm text-gray-500">Reason for Visit</p>
              <p class="font-medium">{{selectedAppointment.reasonForVisit}}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <span [class]="statusClass(selectedAppointment.statusAppointement)"
                class="px-3 py-1 rounded-full text-sm font-medium inline-block mt-1">
                {{selectedAppointment.statusAppointement}}
              </span>
            </div>
          </div>
          <div class="p-6 bg-gray-50 border-t border-gray-100">
            <button (click)="selectedAppointment = null"
              class="w-full px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Success toast -->
      <div *ngIf="showSuccess"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 animate-pulse">
        ✅ Appointment booked successfully!
      </div>

    </div>
  `
})
export class AppointmentsComponent implements OnInit {

  // ─── Patient ID (read dynamically to avoid stale class-init values) ─────────
  private patientId: number = 0;
  loadError: string = '';

  // ─── Page state ──────────────────────────────────────────────────────────────
  myAppointments: AppointmentResponse[] = [];
  loadingList = true;
  selectedAppointment: AppointmentResponse | null = null;

  // ─── New-appointment modal ────────────────────────────────────────────────────
  showNewModal = false;
  step = 1;
  booking = false;
  bookingError = '';
  showSuccess = false;

  // ─── Action loading state ─────────────────────────────────────────────────
  actionLoading: number | null = null;
  reschedulingAptId: number | null = null; // ID of the appointment being rescheduled via new picker

  // ─── Edit modal state ─────────────────────────────────────────────────────
  showEditModal = false;
  editTarget: AppointmentResponse | null = null;
  editReason = '';
  editStatus = 'PENDING';
  editSaving = false;
  editError = '';

  // Step 1 – Specialty
  specialties: string[] = [];
  selectedSpecialty = '';
  loadingSpecialties = false;

  // Step 2 – Doctor
  doctors: Doctor[] = [];
  selectedDoctorId: number | '' = '';
  loadingDoctors = false;

  // Step 3 – Reason
  reasonForVisit = '';

  // Step 4 – Schedule slot
  scheduleSlots: ScheduleSlot[] = [];
  loadingSchedules = false;
  scheduleError = ''; // New: track errors specifically for schedule loading
  selectedSlot: ScheduleSlot | null = null;
  selectedDate: string = ''; // New: track selected date for calendar picker
  datePageStartIndex = 0; // New: start index for week pagination
  showAllSlotsForDate = false; // New: toggle for "Voir plus d'horaires"

  constructor(private svc: AppointmentService) { }

  ngOnInit() {
    // Always read userId fresh from localStorage here, never at field-init time.
    // Number('0') is falsy, so || 0 handles the '0'-string edge case correctly.
    const storedId = localStorage.getItem('userId');
    this.patientId = storedId ? Number(storedId) : 0;
    if (this.patientId > 0) {
      this.loadMyAppointments();
    } else {
      this.loadError = 'Unable to identify your account. Please log out and log in again.';
      this.loadingList = false;
    }
  }

  // ─── Load patient appointments ───────────────────────────────────────────────
  loadMyAppointments() {
    this.loadingList = true;
    this.loadError = '';
    console.log('[Appointments] Loading for patientId:', this.patientId);
    this.svc.getPatientAppointments(this.patientId).subscribe({
      next: (data: AppointmentResponse[]) => {
        console.log('[Appointments] Received:', data);
        this.myAppointments = data;
        this.loadingList = false;
      },
      error: (err: any) => {
        console.error('[Appointments] Failed to load:', err);
        this.myAppointments = [];
        this.loadingList = false;
        this.loadError = `Failed to load appointments (${err?.status ?? 'network error'}). Please try refreshing the page.`;
      }
    });
  }

  // ─── Summary helpers ─────────────────────────────────────────────────────────
  get upcomingAppointments() {
    return this.myAppointments.filter(a =>
      a.statusAppointement === 'PENDING' || a.statusAppointement === 'CONFIRMED'
    );
  }

  get nextVisit(): string | null {
    const upcoming = this.upcomingAppointments;
    if (upcoming.length === 0) return null;
    const next = upcoming[0];
    return this.formatDate(next.scheduleDate);
  }

  // ─── Modal controls ──────────────────────────────────────────────────────────
  openNewModal() {
    this.step = 1;
    this.selectedSpecialty = '';
    this.selectedDoctorId = '';
    this.reasonForVisit = '';
    this.selectedSlot = null;
    this.bookingError = '';
    this.specialties = [];
    this.doctors = [];
    this.scheduleSlots = [];
    this.showNewModal = true;
    this.datePageStartIndex = 0;
    this.showAllSlotsForDate = false;
    this.loadSpecialties();
  }

  closeNewModal() {
    this.showNewModal = false;
  }

  // ─── Step navigation ─────────────────────────────────────────────────────────
  canProceed(): boolean {
    if (this.step === 1) return !!this.selectedSpecialty;
    if (this.step === 2) return !!this.selectedDoctorId;
    if (this.step === 3) return this.reasonForVisit.trim().length > 0;
    return false;
  }

  nextStep() {
    if (!this.canProceed()) return;
    this.bookingError = '';

    if (this.step === 1) {
      this.step = 2;
      this.loadDoctors();
    } else if (this.step === 2) {
      this.step = 3;
    } else if (this.step === 3) {
      this.step = 4;
      this.loadSchedules();
    }
  }

  // ─── Reschedule Patient Response ─────────────────────────────────────────────
  acceptReschedule(apt: AppointmentResponse) {
    this.actionLoading = apt.appointmentId;
    this.svc.acceptReschedule(apt.appointmentId).subscribe({
      next: () => {
        this.actionLoading = null;
        this.loadMyAppointments();
        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 3500);
      },
      error: () => {
        this.actionLoading = null;
        alert('Échec de la confirmation. Veuillez réessayer.');
      }
    });
  }

  startChooseNewSlot(apt: AppointmentResponse) {
    this.reschedulingAptId = apt.appointmentId;
    // Set up the modal to jump straight to step 4 for this doctor
    this.step = 4;
    this.selectedSpecialty = apt.specialty;

    // We need the doctorId to load schedules...
    // The appointment response gives doctor Name, we need to load doctors or use an ad-hoc pass
    // Wait, the appointment response gives doctor Name, but `scheduleSlots` needs doctorId.
    // Let's load the schedules... we don't have doctorId in the generic response unless we fetch the doctor.
    // But since `apt` might have `doctorId`, wait, AppointmentResponse doesn't have doctorId.
    // Let me fetch the doctors for this specialty first.
    this.loadingSchedules = true; // Show loading
    this.showNewModal = true;

    // Remove 'Dr. ' or 'Dr ' prefix if present since the DB just stores the name
    let searchName = apt.doctor || '';
    if (searchName.startsWith('Dr. ')) {
      searchName = searchName.substring(4).trim();
    } else if (searchName.startsWith('Dr ')) {
      searchName = searchName.substring(3).trim();
    }

    this.svc.getDoctorsByName(searchName).subscribe({
      next: (docs) => {
        if (docs.length > 0) {
          const doc = docs[0];
          this.selectedDoctorId = doc.userId;
          this.reasonForVisit = apt.reasonForVisit;
          this.loadSchedules();
        } else {
          this.loadingSchedules = false;
          this.scheduleError = 'Médecin introuvable pour ce nom : ' + searchName;
        }
      },
      error: () => {
        this.loadingSchedules = false;
        this.scheduleError = 'Erreur lors de la récupération du médecin.';
      }
    });
  }



  prevStep() {
    if (this.step > 1) this.step--;
  }

  // ─── API loaders ─────────────────────────────────────────────────────────────
  loadSpecialties() {
    this.loadingSpecialties = true;
    this.svc.getSpecialties().subscribe({
      next: (data: string[]) => { this.specialties = data; this.loadingSpecialties = false; },
      error: () => { this.specialties = []; this.loadingSpecialties = false; }
    });
  }

  loadDoctors() {
    this.loadingDoctors = true;
    this.doctors = [];
    this.selectedDoctorId = '';
    this.svc.getDoctorsBySpecialty(this.selectedSpecialty).subscribe({
      next: (data: Doctor[]) => { this.doctors = data; this.loadingDoctors = false; },
      error: () => { this.doctors = []; this.loadingDoctors = false; }
    });
  }

  loadSchedules() {
    this.loadingSchedules = true;
    this.scheduleSlots = [];
    this.selectedSlot = null;
    this.selectedDate = '';
    console.log('Loading schedules for doctor ID:', this.selectedDoctorId);
    this.svc.getAvailableSchedules(+this.selectedDoctorId).subscribe({
      next: (data: ScheduleSlot[]) => {
        console.log('Schedules received:', data);
        this.scheduleSlots = data;
        this.loadingSchedules = false;
        this.scheduleError = '';
        if (data.length > 0) {
          // Find the first date that has slots
          const firstAvailableSlot = this.visibleDays.find(d => d.hasSlots);
          if (firstAvailableSlot) {
            this.selectedDate = firstAvailableSlot.date;
            this.showAllSlotsForDate = false;
          }
        }
      },
      error: (err: any) => {
        console.error('Error loading schedules:', err);
        this.scheduleSlots = [];
        this.loadingSchedules = false;
        this.scheduleError = 'Impossible de charger les horaires. Vérifiez la connexion avec le serveur.';
      }
    });
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.showAllSlotsForDate = false; // Reset toggle when date changes
    // We don't necessarily clear selectedSlot if it's on a different date,
    // but the UI only shows slots for selectedDate.
  }

  selectSlot(slot: ScheduleSlot) {
    this.selectedSlot = slot;
  }

  // ─── Booking ─────────────────────────────────────────────────────────────────
  get selectedDoctorName(): string {
    const d = this.doctors.find(doc => doc.userId === +this.selectedDoctorId);
    return d ? `Dr. ${d.name}` : '';
  }

  bookAppointment() {
    if (!this.selectedSlot) return;
    this.booking = true;
    this.bookingError = '';

    // Re-read userId at booking time to guarantee freshness
    const currentUserId = Number(localStorage.getItem('userId') || 0);
    if (!currentUserId) {
      this.bookingError = 'Your session has expired. Please log in again.';
      this.booking = false;
      return;
    }

    const req = {
      userId: currentUserId,
      doctor: this.selectedDoctorName,
      service: this.selectedSpecialty,
      specialty: this.selectedSpecialty,
      reasonForVisit: this.reasonForVisit,
      statusAppointement: 'PENDING',
      scheduleId: this.selectedSlot.scheduleId
    };

    console.log('Sending booking request:', req);

    // If this is a "choose another slot" reschedule flow:
    // 1) First cancel the old pending appointment, THEN create the new one.
    if (this.reschedulingAptId) {
      const oldAptId = this.reschedulingAptId;
      this.svc.rejectReschedule(oldAptId).subscribe({
        next: () => {
          // Old appointment is now CANCELLED — safe to create the new one
          this.svc.createAppointment(req).subscribe({
            next: () => {
              this.booking = false;
              this.showNewModal = false;
              this.showSuccess = true;
              this.reschedulingAptId = null;
              this.loadMyAppointments();
              setTimeout(() => this.showSuccess = false, 3500);
            },
            error: (err: any) => {
              this.booking = false;
              this.bookingError = err?.error?.message ?? 'Booking failed. Please try again.';
            }
          });
        },
        error: () => {
          // Even if rejection fails, still create the new appointment
          this.svc.createAppointment(req).subscribe({
            next: () => {
              this.booking = false;
              this.showNewModal = false;
              this.showSuccess = true;
              this.reschedulingAptId = null;
              this.loadMyAppointments();
              setTimeout(() => this.showSuccess = false, 3500);
            },
            error: (err: any) => {
              this.booking = false;
              this.bookingError = err?.error?.message ?? 'Booking failed. Please try again.';
            }
          });
        }
      });
    } else {
      // Normal booking (not a reschedule)
      this.svc.createAppointment(req).subscribe({
        next: () => {
          this.booking = false;
          this.showNewModal = false;
          this.showSuccess = true;
          this.reschedulingAptId = null;
          this.loadMyAppointments();
          setTimeout(() => this.showSuccess = false, 3500);
        },
        error: (err: any) => {
          this.booking = false;
          this.bookingError = err?.error?.message ?? 'Booking failed. Please try again.';
        }
      });
    }
  }

  // ─── Cancel appointment ───────────────────────────────────────────────────
  cancelApt(apt: AppointmentResponse) {
    if (!confirm(`Cancel appointment with ${apt.doctor}?`)) return;
    this.actionLoading = apt.appointmentId;
    this.svc.cancelAppointment(apt.appointmentId).subscribe({
      next: () => { this.actionLoading = null; this.loadMyAppointments(); },
      error: () => { this.actionLoading = null; alert('Failed to cancel. Please try again.'); }
    });
  }

  // ─── Delete appointment ───────────────────────────────────────────────────
  deleteApt(apt: AppointmentResponse) {
    if (!confirm(`Permanently delete this appointment with ${apt.doctor}? This cannot be undone.`)) return;
    this.actionLoading = apt.appointmentId;
    this.svc.deleteAppointment(apt.appointmentId).subscribe({
      next: () => { this.actionLoading = null; this.loadMyAppointments(); },
      error: () => { this.actionLoading = null; alert('Failed to delete. Please try again.'); }
    });
  }

  // ─── Edit modal ───────────────────────────────────────────────────────────
  openEditModal(apt: AppointmentResponse) {
    this.editTarget = apt;
    this.editReason = apt.reasonForVisit;
    this.editStatus = apt.statusAppointement;
    this.editError = '';
    this.showEditModal = true;
  }

  saveEdit() {
    if (!this.editTarget) return;
    this.editSaving = true;
    this.editError = '';

    // Update status via PATCH
    this.svc.updateAppointmentStatus(this.editTarget.appointmentId, this.editStatus).subscribe({
      next: () => {
        this.editSaving = false;
        this.showEditModal = false;
        this.loadMyAppointments();
      },
      error: (err: any) => {
        this.editSaving = false;
        this.editError = err?.error?.message ?? 'Save failed. Please try again.';
      }
    });
  }

  // ─── Details modal ───────────────────────────────────────────────────────────
  viewDetails(apt: AppointmentResponse) {
    this.selectedAppointment = apt;
  }

  // ─── Schedule grouping ───────────────────────────────────────────────────────
  get groupedSlots(): { date: string; slots: ScheduleSlot[] }[] {
    const map = new Map<string, ScheduleSlot[]>();
    for (const slot of this.scheduleSlots) {
      const arr = map.get(slot.date) ?? [];
      arr.push(slot);
      map.set(slot.date, arr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, slots]) => ({ date, slots: slots.sort((x, y) => String(x.startTime).localeCompare(String(y.startTime))) }));
  }

  // ─── Pagination & Limits ───────────────────────────────────────────────────
  // ─── Pagination & Limits ───────────────────────────────────────────────────
  get visibleDays(): { date: string; dateObj: Date; hasSlots: boolean; slots: ScheduleSlot[] }[] {
    const today = new Date();
    // Use local timezone midnight to avoid shifting
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + this.datePageStartIndex);

    const days = [];

    // Create a map for quick lookup
    const groups: { [date: string]: ScheduleSlot[] } = {};
    for (const group of this.groupedSlots) {
      groups[group.date] = group.slots;
    }

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      days.push({
        date: dateStr,
        dateObj: d,
        hasSlots: !!groups[dateStr] && groups[dateStr].length > 0,
        slots: groups[dateStr] || []
      });
    }
    return days;
  }

  nextDatePage() {
    this.datePageStartIndex += 7;
  }

  prevDatePage() {
    if (this.datePageStartIndex >= 7) {
      this.datePageStartIndex -= 7;
    } else {
      this.datePageStartIndex = 0;
    }
  }

  getVisibleSlots(slots: ScheduleSlot[]): ScheduleSlot[] {
    if (this.showAllSlotsForDate) {
      return slots;
    }
    return slots.slice(0, 4);
  }

  // ─── Formatting helpers ──────────────────────────────────────────────────────
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatTime(time: any): string {
    if (!time) return '';
    // Handle array format [HH, mm, ss] or [HH, mm]
    if (Array.isArray(time)) {
      const hh = time[0].toString().padStart(2, '0');
      const mm = time[1].toString().padStart(2, '0');
      return `${hh}:${mm}`;
    }
    // Handle string format "HH:mm:ss"
    if (typeof time === 'string') {
      return time.substring(0, 5);
    }
    return '';
  }

  getDayName(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
  }

  getDay(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate().toString().padStart(2, '0');
  }

  getMonth(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
  }

  getCurrentMonthYear(): string {
    if (this.selectedDate) {
      const d = new Date(this.selectedDate + 'T00:00:00');
      const month = d.toLocaleDateString('fr-FR', { month: 'long' });
      return (month.charAt(0).toUpperCase() + month.slice(1)) + ' ' + d.getFullYear();
    }
    const now = new Date();
    const month = now.toLocaleDateString('fr-FR', { month: 'long' });
    return (month.charAt(0).toUpperCase() + month.slice(1)) + ' ' + now.getFullYear();
  }

  statusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'RESCHEDULED_PENDING': return 'bg-amber-200 text-amber-900 border border-amber-300 shadow-sm';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
