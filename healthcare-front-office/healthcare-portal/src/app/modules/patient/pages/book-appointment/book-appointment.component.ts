import { Component, OnInit } from '@angular/core';
import {
  AppointmentService,
  Doctor,
  ScheduleSlot,
  AppointmentResponse,
  VerificationRequest
} from '../../services/appointment.service';

const STEPS = ['Date/Heure', 'Vérification', 'Confirmation', 'Succès'];

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.scss']
})
export class BookAppointmentComponent implements OnInit {
  // Search
  searchMode: 'specialty' | 'name' = 'specialty';
  selectedSpecialty = '';
  searchName = '';
  specialties: string[] = [];
  doctors: Doctor[] = [];
  loadingDoctors = false;
  loadingSpecialties = false;

  // Selected doctor
  selectedDoctor: Doctor | null = null;

  // Schedule
  scheduleSlots: ScheduleSlot[] = [];
  loadingSchedules = false;
  scheduleError = '';
  selectedDate = '';
  selectedSlot: ScheduleSlot | null = null;
  reasonForVisit = '';
  currentMonthOffset = 0;

  // Pagination & Display limits
  currentDateStart: Date | null = null;
  showAllSlotsForDate = false;

  // Verification — pre-filled from logged-in account
  patientName = '';
  patientEmail = '';
  verificationId = '';
  sendingCode = false;
  verificationError = '';

  // Confirmation
  verificationCode = '';
  confirming = false;
  confirmError = '';

  // Success
  confirmedAppointment: AppointmentResponse | null = null;

  currentStep = 0;
  readonly steps = STEPS;
  patientId = 0;  // set in ngOnInit from localStorage

  constructor(private svc: AppointmentService) { }

  ngOnInit() {
    // Read from localStorage in ngOnInit — never as class field initializers.
    // Login stores keys: 'userId', 'UserName', 'EmailUserConnect'
    this.patientId = Number(localStorage.getItem('userId') || 0);
    this.patientName = localStorage.getItem('UserName') || '';
    this.patientEmail = localStorage.getItem('EmailUserConnect') || '';
    this.loadSpecialties();
  }

  get groupedSlots(): { date: string; slots: ScheduleSlot[] }[] {
    const map = new Map<string, ScheduleSlot[]>();
    for (const slot of this.scheduleSlots) {
      const d = this.slotDate(slot);
      const arr = map.get(d) ?? [];
      arr.push(slot);
      map.set(d, arr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, slots]) => ({ date, slots: slots.sort((x, y) => this.slotTime(x).localeCompare(this.slotTime(y))) }));
  }

  // ─── Pagination & Limits ───────────────────────────────────────────────────
  get currentWeekDays() {
    if (!this.currentDateStart) return [];
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.currentDateStart.getFullYear(), this.currentDateStart.getMonth(), this.currentDateStart.getDate() + i);
      const dateStr = [
        d.getFullYear(),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getDate().toString().padStart(2, '0')
      ].join('-');
      const group = this.groupedSlots.find(g => g.date === dateStr);
      days.push({
        date: dateStr,
        hasSlots: !!group,
        slots: group ? group.slots : []
      });
    }
    return days;
  }

  nextDatePage() {
    if (this.currentDateStart) {
      const d = new Date(this.currentDateStart);
      d.setDate(d.getDate() + 7);
      this.currentDateStart = d;
    }
  }

  prevDatePage() {
    if (this.currentDateStart) {
      const d = new Date(this.currentDateStart);
      d.setDate(d.getDate() - 7);
      
      // Optional: limit moving to past before today? 
      // For now we allow it, but mostly doctors have future availability.
      this.currentDateStart = d;
    }
  }

  getVisibleSlots(slots: ScheduleSlot[]): ScheduleSlot[] {
    if (this.showAllSlotsForDate) {
      return slots;
    }
    return slots.slice(0, 4);
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.showAllSlotsForDate = false;
  }

  slotDate(slot: ScheduleSlot): string {
    if (typeof slot.date === 'string') return slot.date;
    return (slot as any).date || '';
  }

  slotTime(slot: ScheduleSlot): string {
    const t = slot.startTime;
    if (typeof t === 'string') return t.substring(0, 5);
    if (Array.isArray(t)) return `${String(t[0]).padStart(2, '0')}:${String(t[1]).padStart(2, '0')}`;
    return '';
  }

  loadSpecialties() {
    this.loadingSpecialties = true;
    this.svc.getSpecialties().subscribe({
      next: (d) => { this.specialties = d; this.loadingSpecialties = false; },
      error: () => { this.specialties = []; this.loadingSpecialties = false; }
    });
  }

  searchDoctors() {
    if (this.searchMode === 'specialty' && !this.selectedSpecialty) return;
    if (this.searchMode === 'name' && !this.searchName.trim()) return;
    this.loadingDoctors = true;
    this.doctors = [];
    const obs = this.searchMode === 'specialty'
      ? this.svc.getDoctorsBySpecialty(this.selectedSpecialty)
      : this.svc.getDoctorsByName(this.searchName.trim());
    obs.subscribe({
      next: (d) => {
        this.doctors = d;
        this.loadingDoctors = false;
        // If name search returns nothing, try specialty search with same text
        if (this.searchMode === 'name' && d.length === 0 && this.searchName.trim()) {
          this.loadingDoctors = true;
          this.svc.getDoctorsBySpecialty(this.searchName.trim()).subscribe({
            next: (d2) => { this.doctors = d2; this.loadingDoctors = false; },
            error: () => { this.loadingDoctors = false; }
          });
        }
      },
      error: () => { this.doctors = []; this.loadingDoctors = false; }
    });
  }

  selectDoctor(doc: Doctor) {
    this.selectedDoctor = doc;
    this.currentStep = 0;
    this.loadSchedules();
  }

  backToDoctors() {
    this.selectedDoctor = null;
    this.scheduleSlots = [];
    this.selectedSlot = null;
    this.selectedDate = '';
    this.currentDateStart = null;
    this.showAllSlotsForDate = false;
  }

  loadSchedules() {
    if (!this.selectedDoctor) return;
    this.loadingSchedules = true;
    this.scheduleError = '';
    this.svc.getAvailableSchedules(this.selectedDoctor.userId).subscribe({
      next: (d) => {
        this.scheduleSlots = Array.isArray(d) ? d : [];
        this.loadingSchedules = false;
        if (this.scheduleSlots.length > 0) {
          const g = this.groupedSlots;
          if (g.length > 0) {
             this.selectedDate = g[0].date;
             // Calculate the Monday (or start of week) of the first available date
             const firstDate = new Date(g[0].date + 'T00:00:00');
             const day = firstDate.getDay(); 
             // Adjust to make Monday the start of the week (0 = Mon, 6 = Sun)
             const diff = firstDate.getDate() - day + (day === 0 ? -6 : 1);
             this.currentDateStart = new Date(firstDate.getFullYear(), firstDate.getMonth(), diff);
             this.showAllSlotsForDate = false;
          }
        }
      },
      error: () => {
        this.scheduleSlots = [];
        this.loadingSchedules = false;
        this.scheduleError = 'Impossible de charger les horaires.';
      }
    });
  }

  canProceedDateHeure(): boolean {
    return !!this.selectedSlot && this.reasonForVisit.trim().length > 0;
  }

  goToVerification() {
    if (!this.canProceedDateHeure()) return;
    this.currentStep = 1;
    this.verificationError = '';
    // Always refresh from localStorage to ensure correct patient identity
    this.patientName = localStorage.getItem('UserName') || this.patientName;
    this.patientEmail = localStorage.getItem('EmailUserConnect') || this.patientEmail;
  }

  canProceedVerification(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.patientName.trim().length > 0 && emailRegex.test(this.patientEmail.trim());
  }

  sendVerificationCode() {
    if (!this.canProceedVerification() || !this.selectedSlot || !this.selectedDoctor) return;
    this.sendingCode = true;
    this.verificationError = '';
    const req: VerificationRequest = {
      userId: this.patientId,
      patientName: this.patientName.trim(),
      patientEmail: this.patientEmail.trim(),
      scheduleId: this.selectedSlot.scheduleId,
      doctor: `Dr ${this.selectedDoctor.name}`,
      specialty: this.selectedDoctor.specialty || '',
      reasonForVisit: this.reasonForVisit
    };
    this.svc.sendVerification(req).subscribe({
      next: (r) => {
        this.verificationId = r.verificationId;
        this.currentStep = 2;
        this.sendingCode = false;
        this.verificationCode = '';
        this.confirmError = '';
      },
      error: (e) => {
        this.verificationError = e?.error?.message || 'Erreur lors de l\'envoi du code.';
        this.sendingCode = false;
      }
    });
  }

  validateCode() {
    if (!this.verificationCode || this.verificationCode.length !== 4) {
      this.confirmError = 'Veuillez saisir le code à 4 chiffres.';
      return;
    }
    this.confirming = true;
    this.confirmError = '';
    this.svc.verifyAndConfirm(this.verificationId, this.verificationCode).subscribe({
      next: (apt) => {
        this.confirmedAppointment = apt;
        this.currentStep = 3;
        this.confirming = false;
      },
      error: (e) => {
        this.confirmError = e?.error?.message || 'Code invalide ou expiré.';
        this.confirming = false;
      }
    });
  }

  reschedule() {
    this.currentStep = 0;
    this.confirmedAppointment = null;
    this.selectedSlot = null;
    this.loadSchedules();
  }

  cancelBooking() {
    this.selectedDoctor = null;
    this.selectedSlot = null;
    this.confirmedAppointment = null;
    this.currentStep = 0;
    this.reasonForVisit = '';
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatTimeDisplay(slot: ScheduleSlot): string {
    return this.slotTime(slot);
  }

  getDisplayEmail(): string {
    return this.patientEmail.trim();
  }

  getCurrentMonthYear(): string {
    const targetDate = this.selectedDate || (this.currentDateStart ? this.currentDateStart.toISOString().split('T')[0] : null);
    if (targetDate) {
      const d = new Date(targetDate + 'T00:00:00');
      const m = d.toLocaleDateString('fr-FR', { month: 'long' });
      return m.charAt(0).toUpperCase() + m.slice(1) + ' ' + d.getFullYear();
    }
    const n = new Date();
    const m = n.toLocaleDateString('fr-FR', { month: 'long' });
    return m.charAt(0).toUpperCase() + m.slice(1) + ' ' + n.getFullYear();
  }

  getDayName(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
  }

  getDayNum(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').getDate().toString();
  }

  getMonthShort(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
  }
}
