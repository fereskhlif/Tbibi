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
  patientName: string = '';
  patientEmail: string = '';
  patientPhone: string = '';
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

  // ── Booking mode ─────────────────────────────────────────────────────────
  bookingMode: 'doctor' | 'physiotherapist' | 'laboratory' = 'doctor';

  // ── Physiotherapist booking ───────────────────────────────────────────────
  physiotherapists: Doctor[] = [];
  loadingPhysios = false;
  selectedPhysio: Doctor | null = null;
  selectedTherapyType = '';
  physioReason = '';
  physioSaving = false;
  physioError = '';
  physioSuccess: AppointmentResponse | null = null;
  physioSlots: ScheduleSlot[] = [];
  loadingPhysioSlots = false;
  selectedPhysioSlot: ScheduleSlot | null = null;
  physioStep = 0;
  physioWeekStart: Date | null = null;
  physioSelectedDate = '';
  physioShowAllSlots = false;

  readonly therapyTypes = [
    'Kinésithérapie générale',
    'Rééducation sportive',
    'Rééducation post-opératoire',
    'Massage thérapeutique',
    'Électrothérapie',
    'Balnéothérapie'
  ];

  // ── Laboratory booking ────────────────────────────────────────────────────
  laboratories: Doctor[] = [];
  loadingLabs = false;
  selectedLab: Doctor | null = null;
  selectedAnalysisType = '';
  labNotes = '';
  labSaving = false;
  labError = '';
  labSuccess: AppointmentResponse | null = null;
  labSlots: ScheduleSlot[] = [];
  loadingLabSlots = false;
  selectedLabSlot: ScheduleSlot | null = null;
  labAnalysisTypesList: string[] = [];
  labStep = 0;
  labWeekStart: Date | null = null;
  labSelectedDate = '';
  labShowAllSlots = false;

  readonly analysisTypes = [
    'Bilan sanguin complet',
    'Glycémie à jeun',
    'ECG (Électrocardiogramme)',
    'Radiographie',
    'Échographie',
    'Analyse d\'urine',
    'Test COVID-19 / PCR',
    'Bilan lipidique',
    'Fonction hépatique',
    'Fonction rénale'
  ];

  constructor(private svc: AppointmentService) { }

  ngOnInit() {
    // Read from localStorage in ngOnInit — never as class field initializers.
    // Login stores keys: 'userId', 'UserName', 'EmailUserConnect'
    this.patientId = Number(localStorage.getItem('userId') || 0);
    this.patientName = localStorage.getItem('UserName') || '';
    this.patientEmail = localStorage.getItem('EmailUserConnect') || '';
    this.patientPhone = localStorage.getItem('PhoneNumber') || '';
    this.loadSpecialties();
    this.loadPhysiotherapists();
    this.loadLaboratories();
  }

  setMode(mode: 'doctor' | 'physiotherapist' | 'laboratory') {
    this.bookingMode = mode;
    this.physioError = '';
    this.labError = '';
    this.physioSuccess = null;
    this.labSuccess = null;
  }

  loadPhysiotherapists() {
    this.loadingPhysios = true;
    this.svc.getPhysiotherapists().subscribe({
      next: list => { this.physiotherapists = list; this.loadingPhysios = false; },
      error: () => { this.loadingPhysios = false; }
    });
  }

  loadLaboratories() {
    this.loadingLabs = true;
    this.svc.getLaboratories().subscribe({
      next: list => { this.laboratories = list; this.loadingLabs = false; },
      error: () => { this.loadingLabs = false; }
    });
  }

  selectPhysio(physio: Doctor) {
    this.selectedPhysio = physio;
    this.selectedTherapyType = '';
    this.selectedPhysioSlot = null;
    this.physioSlots = [];
    this.physioStep = 0;
    this.physioSelectedDate = '';
    this.physioWeekStart = null;
    this.physioShowAllSlots = false;
    this.physioError = '';
    this.physioSuccess = null;
    this.loadingPhysioSlots = true;
    this.svc.getAvailableSchedules(physio.userId).subscribe({
      next: slots => {
        this.physioSlots = slots;
        this.loadingPhysioSlots = false;
        this._initWeek(this.physioGroupedSlots, d => { this.physioSelectedDate = d; }, w => { this.physioWeekStart = w; });
      },
      error: () => { this.loadingPhysioSlots = false; }
    });
  }

  selectLab(lab: Doctor) {
    this.selectedLab = lab;
    this.selectedAnalysisType = '';
    this.selectedLabSlot = null;
    this.labSlots = [];
    this.labStep = 0;
    this.labSelectedDate = '';
    this.labWeekStart = null;
    this.labShowAllSlots = false;
    this.labError = '';
    this.labSuccess = null;
    this.loadLabAnalysisTypes(lab.userId);
    this.loadingLabSlots = true;
    this.svc.getAvailableSchedules(lab.userId).subscribe({
      next: slots => {
        this.labSlots = slots;
        this.loadingLabSlots = false;
        this._initWeek(this.labGroupedSlots, d => { this.labSelectedDate = d; }, w => { this.labWeekStart = w; });
      },
      error: () => { this.loadingLabSlots = false; }
    });
  }

  loadLabAnalysisTypes(labId: number) {
    const key = `lab_analysis_types_${labId}`;
    const stored = localStorage.getItem(key);
    this.labAnalysisTypesList = stored ? JSON.parse(stored) : this.analysisTypes;
  }

  private _initWeek(grouped: {date:string}[], setDate: (d:string)=>void, setWeek: (w:Date)=>void) {
    if (!grouped.length) return;
    setDate(grouped[0].date);
    const first = new Date(grouped[0].date + 'T00:00:00');
    const day = first.getDay();
    const diff = first.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(first.getFullYear(), first.getMonth(), diff);
    const today = new Date(); today.setHours(0,0,0,0);
    setWeek(weekStart < today ? today : weekStart);
  }

  get physioGroupedSlots(): { date: string; slots: ScheduleSlot[] }[] {
    return this._groupSlots(this.physioSlots);
  }

  get labGroupedSlots(): { date: string; slots: ScheduleSlot[] }[] {
    return this._groupSlots(this.labSlots);
  }

  private _groupSlots(slots: ScheduleSlot[]): { date: string; slots: ScheduleSlot[] }[] {
    const map = new Map<string, ScheduleSlot[]>();
    for (const s of slots) { const a = map.get(s.date) ?? []; a.push(s); map.set(s.date, a); }
    return Array.from(map.entries())
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([date, ss]) => ({ date, slots: ss.sort((x,y) => this.slotTime(x).localeCompare(this.slotTime(y))) }));
  }

  weekDaysFor(weekStart: Date | null, grouped: {date:string;slots:ScheduleSlot[]}[]) {
    if (!weekStart) return [];
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
      const ds = [d.getFullYear(), (d.getMonth()+1).toString().padStart(2,'0'), d.getDate().toString().padStart(2,'0')].join('-');
      const g = grouped.find(x => x.date === ds);
      days.push({ date: ds, hasSlots: !!g, slots: g ? g.slots : [] });
    }
    return days;
  }

  shiftWeek(weekStart: Date | null, dir: 1|-1): Date | null {
    if (!weekStart) return null;
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    if (dir === -1) { const t = new Date(); t.setHours(0,0,0,0); return d < t ? t : d; }
    return d;
  }

  canGoPrevFor(weekStart: Date | null): boolean {
    if (!weekStart) return false;
    const t = new Date(); t.setHours(0,0,0,0);
    return weekStart > t;
  }

  monthYearFor(weekStart: Date | null, selDate: string): string {
    const target = selDate || (weekStart ? weekStart.toISOString().split('T')[0] : null);
    if (!target) { const n = new Date(); return n.toLocaleDateString('fr-FR',{month:'long',year:'numeric'}); }
    const d = new Date(target + 'T00:00:00');
    const m = d.toLocaleDateString('fr-FR',{month:'long'}); 
    return m.charAt(0).toUpperCase()+m.slice(1)+' '+d.getFullYear();
  }

  submitPhysioBooking() {
    if (!this.selectedPhysio || !this.selectedTherapyType || !this.selectedPhysioSlot) return;
    this.physioSaving = true;
    this.physioError = '';
    this.svc.bookPhysio({
      patientId: this.patientId,
      physiotherapistId: this.selectedPhysio.userId,
      therapyType: this.selectedTherapyType,
      reasonForVisit: this.physioReason,
      preferredDate: this.selectedPhysioSlot.date,
      patientName: this.patientName,
      patientEmail: this.patientEmail,
      patientPhone: this.patientPhone
    }).subscribe({
      next: res => { this.physioSuccess = res; this.physioSaving = false; this.physioStep = 3; },
      error: err => { this.physioError = err?.error?.message || 'Erreur lors de la réservation.'; this.physioSaving = false; }
    });
  }

  submitLabBooking() {
    if (!this.selectedLab || !this.selectedAnalysisType || !this.selectedLabSlot) return;
    this.labSaving = true;
    this.labError = '';
    this.svc.bookLab({
      patientId: this.patientId,
      laboratoryId: this.selectedLab.userId,
      analysisType: this.selectedAnalysisType,
      notes: this.labNotes,
      preferredDate: this.selectedLabSlot.date,
      patientName: this.patientName,
      patientEmail: this.patientEmail,
      patientPhone: this.patientPhone
    }).subscribe({
      next: res => { this.labSuccess = res; this.labSaving = false; this.labStep = 3; },
      error: err => { this.labError = err?.error?.message || 'Erreur lors de la réservation.'; this.labSaving = false; }
    });
  }


  /** Returns today's date as yyyy-MM-dd for [min] on date inputs */
  get today(): string {
    const d = new Date();
    return [
      d.getFullYear(),
      (d.getMonth() + 1).toString().padStart(2, '0'),
      d.getDate().toString().padStart(2, '0')
    ].join('-');
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const d = new Date(this.currentDateStart);
      d.setDate(d.getDate() - 7);
      // Don't go to a week that starts before today
      this.currentDateStart = d < today ? today : d;
    }
  }

  get canGoPrev(): boolean {
    if (!this.currentDateStart) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.currentDateStart > today;
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
            // Calculate the Monday of the first available date's week
            const firstDate = new Date(g[0].date + 'T00:00:00');
            const day = firstDate.getDay();
            const diff = firstDate.getDate() - day + (day === 0 ? -6 : 1);
            const weekStart = new Date(firstDate.getFullYear(), firstDate.getMonth(), diff);
            // Never show a week that has already fully passed — clamp to today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            this.currentDateStart = weekStart < today ? today : weekStart;
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
    this.patientPhone = localStorage.getItem('PhoneNumber') || this.patientPhone;
  }

  canProceedVerification(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+ ]{8,15}$/;
    return this.patientName.trim().length > 0 &&
      emailRegex.test(this.patientEmail.trim()) &&
      this.patientPhone.trim().length > 0 &&
      phoneRegex.test(this.patientPhone.trim());
  }

  sendVerificationCode() {
    if (!this.canProceedVerification() || !this.selectedSlot || !this.selectedDoctor) return;
    this.sendingCode = true;
    this.verificationError = '';
    const req: VerificationRequest = {
      userId: this.patientId,
      patientName: this.patientName.trim(),
      patientEmail: this.patientEmail.trim(),
      patientPhone: this.patientPhone.trim(),
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
