import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ChronicConditionService,
  ChronicConditionRequest,
  ChronicConditionResponse
} from '../../services/chronic-condition.service';
export interface AlertToast {
  id: number;
  severity: string;
  message: string;
  patientName: string;
  type: string;
  value: string;
}

interface PatientOption { id: number; name: string; }

interface LiveVital {
  type: string;
  icon: string;
  label: string;
  unit: string;
  value: number | null;
  value2?: number | null;
  severity: string;
  previousSeverity?: string;  // Track previous severity to detect changes
}


@Component({
  selector: 'app-chronic-disease',
  template: `
<div class="p-6 space-y-6">

  <!-- Header -->
  <div class="flex items-center justify-between flex-wrap gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Chronic Disease Monitor</h1>
      <p class="text-gray-500 text-sm mt-1">Real-time smartwatch vitals — automatic alerts & records on critical readings</p>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════════ -->
  <!-- LIVE SMARTWATCH MONITOR PANEL -->
  <!-- ═══════════════════════════════════════════════════════════════════════ -->
  <div class="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 shadow-2xl border border-blue-800/40">
    <!-- Panel header -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl shadow-lg">⌚</div>
        <div>
          <h2 class="text-black font-bold text-lg">Live Smartwatch Monitor</h2>
          <p class="text-blue-300 text-xs">Real-time vitals — CRITICAL readings are saved automatically</p>
        </div>
        <span *ngIf="monitoring" class="flex items-center gap-1.5 bg-green-500/20 border border-green-500/50 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-ping inline-block"></span>
          LIVE
        </span>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Patient selector from real application patients -->
        <select [(ngModel)]="selectedPatient"
          (change)="onPatientSelected()"
          class="bg-slate-800 text-black border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          [disabled]="monitoring || loadingPatients">
          <option [ngValue]="null">{{loadingPatients ? 'Loading patients…' : '— Select patient —'}}</option>
          <option *ngFor="let p of patients" [ngValue]="p">{{p.name}}</option>
        </select>

        <button *ngIf="!monitoring" (click)="startMonitor()"
          [disabled]="!selectedPatient || loadingPatients"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-40 flex items-center gap-2 shadow-lg">
          ▶ Start Monitoring
        </button>
        <button *ngIf="monitoring" (click)="stopMonitor()"
          class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg">
          ⏹ Stop Monitoring
        </button>
      </div>
    </div>

    <!-- Vital cards grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div *ngFor="let v of liveVitals"
        [class]="'rounded-xl p-4 border transition-all duration-500 ' + vitalCardClass(v)">
        <div class="flex items-center justify-between mb-2">
          <span class="text-2xl">{{v.icon}}</span>
          <span [class]="'text-xs font-bold px-2 py-0.5 rounded-full ' + severityChip(v.severity)">
            {{v.severity || '—'}}
          </span>
        </div>
        <p class="text-3xl font-extrabold text-black leading-none">
          <span *ngIf="v.value !== null">
            {{v.value}}<span *ngIf="v.value2 !== null && v.value2 !== undefined">/{{v.value2}}</span>
          </span>
          <span *ngIf="v.value === null" class="text-slate-500 text-2xl">—</span>
        </p>
        <p class="text-slate-400 text-xs mt-1">{{v.label}} <span class="text-slate-500">({{v.unit}})</span></p>
        <p *ngIf="vitalDirection(v) as dir" [class]="'text-xs font-bold mt-1 ' + (dir.startsWith('↑') ? 'text-red-400' : 'text-blue-400')">{{dir}}</p>
      </div>
    </div>

    <p *ngIf="!monitoring && !selectedPatient" class="text-center text-slate-500 text-sm mt-4">
      Select a patient from the dropdown and click ▶ Start Monitoring.
    </p>
    <p *ngIf="!monitoring && selectedPatient" class="text-center text-slate-500 text-sm mt-4">
      Ready to monitor <strong class="text-white">{{selectedPatient.name}}</strong>. Click ▶ Start Monitoring.
    </p>
  </div>


  <!-- Stats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p class="text-3xl font-bold text-gray-900">{{records.length}}</p>
      <p class="text-xs text-gray-500 mt-1">Total Readings</p>
    </div>
    <div class="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
      <p class="text-3xl font-bold text-red-600">{{countBySeverity('CRITICAL')}}</p>
      <p class="text-xs text-red-500 mt-1">🚨 Critical</p>
    </div>
    <div class="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center">
      <p class="text-3xl font-bold text-yellow-600">{{countBySeverity('WARNING')}}</p>
      <p class="text-xs text-yellow-500 mt-1">⚠️ Warning</p>
    </div>
    <div class="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
      <p class="text-3xl font-bold text-green-600">{{countBySeverity('NORMAL')}}</p>
      <p class="text-xs text-green-500 mt-1">✅ Normal</p>
    </div>
  </div>

  <!-- Critical Alert Banner -->
  <div *ngIf="countBySeverity('CRITICAL') > 0" class="bg-red-600 text-white rounded-xl p-4 flex items-center gap-3 shadow-lg">
    <span class="text-2xl">🚨</span>
    <div>
      <p class="font-bold">{{countBySeverity('CRITICAL')}} CRITICAL reading(s) detected!</p>
      <p class="text-red-100 text-sm">Immediate attention required — low blood sugar, high blood pressure, or low oxygen levels.</p>
    </div>
  </div>

  <!-- Filters & Search -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div class="flex flex-wrap gap-2">
      <button *ngFor="let f of filters" (click)="activeFilter = f.key"
        [class]="'px-3 py-1.5 rounded-full text-sm font-medium border transition ' + (activeFilter === f.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400')">
        {{f.label}}
      </button>
    </div>
    <div class="relative w-full md:w-64">
      <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
      <input type="text" [(ngModel)]="searchQuery" placeholder="Search patient name..."
        class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm placeholder-gray-400" />
    </div>
  </div>

  <!-- Records list -->
  <div *ngIf="loading" class="text-center py-12 text-gray-400">Loading readings…</div>
  <div *ngIf="!loading && filteredRecords.length === 0" class="text-center py-12 text-gray-400">
    No critical readings yet. Start monitoring a patient to begin tracking.
  </div>

  <div class="space-y-3">
    <div *ngFor="let r of filteredRecords"
      [class]="'bg-white border-l-4 rounded-xl p-5 shadow-sm flex items-start justify-between gap-4 flex-wrap ' + borderColor(r.severity)">
      <div class="flex gap-4 items-start">
        <div [class]="'text-3xl w-14 h-14 rounded-xl flex items-center justify-center ' + iconBg(r.severity)">
          {{conditionIcon(r.conditionType)}}
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-gray-900">{{conditionLabel(r.conditionType)}}</span>
            <span [class]="'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ' + severityBadge(r.severity)">
              {{r.severity}}
            </span>
          </div>
          <p class="text-2xl font-extrabold mt-1" [class]="severityText(r.severity)">{{r.displayValue}}</p>
          <p class="text-sm text-gray-500 mt-1">👤 {{r.patientName}}&nbsp;&nbsp;🕐 {{formatDate(r.recordedAt)}}</p>
          <p *ngIf="r.notes" class="text-sm text-gray-600 mt-1 italic">📝 {{r.notes}}</p>
          <p *ngIf="r.severity === 'CRITICAL'" [class]="'text-sm font-semibold mt-1 ' + severityText(r.severity)">
            ⚡ {{criticalMessage(r)}}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <button (click)="deleteRecord(r.id)" class="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">🗑️ Delete</button>
      </div>
    </div>
  </div>

</div>

<style>
@keyframes slideIn {
  from { opacity: 0; transform: translateX(100%); }
  to   { opacity: 1; transform: translateX(0); }
}
</style>
`
})
export class ChronicDiseaseComponent implements OnInit, OnDestroy {
  readonly doctorId = Number(localStorage.getItem('userId') ?? 0);

  records: ChronicConditionResponse[] = [];
  loading = false;
  activeFilter = 'ALL';
  searchQuery = '';

  filters = [
    { key: 'ALL', label: 'All' },
    { key: 'CRITICAL', label: '🚨 Critical' },
    { key: 'WARNING', label: '⚠️ Warning' },
    { key: 'NORMAL', label: '✅ Normal' },
    { key: 'BLOOD_SUGAR', label: '🩸 Blood Sugar' },
    { key: 'BLOOD_PRESSURE', label: '💓 Blood Pressure' },
    { key: 'OXYGEN_SATURATION', label: '🫁 Oxygen' },
    { key: 'HEART_RATE', label: '❤️ Heart Rate' },
  ];

  // ── Patients from the application ──────────────────────────────────────────
  patients: PatientOption[] = [];
  loadingPatients = false;
  selectedPatient: PatientOption | null = null;

  // ── Smartwatch state ────────────────────────────────────────────────────────
  monitoring = false;
  private monitorInterval: any = null;
  private alertIdCounter = 0;
  alerts: AlertToast[] = [];

  // Track if we sent email for current tracking session, to avoid spam
  private emailsSent = { WARNING: false, CRITICAL: false };

  liveVitals: LiveVital[] = [
    { type: 'BLOOD_SUGAR', icon: '🩸', label: 'Blood Sugar', unit: 'mg/dL', value: null, severity: '', previousSeverity: '' },
    { type: 'BLOOD_PRESSURE', icon: '💓', label: 'Blood Pressure', unit: 'mmHg', value: null, value2: null, severity: '', previousSeverity: '' },
    { type: 'OXYGEN_SATURATION', icon: '🫁', label: 'Oxygen Saturation', unit: '%', value: null, severity: '', previousSeverity: '' },
    { type: 'HEART_RATE', icon: '❤️', label: 'Heart Rate', unit: 'bpm', value: null, severity: '', previousSeverity: '' },
  ];

  constructor(
    private svc: ChronicConditionService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.load();
    this.loadPatients();
  }

  ngOnDestroy() { this.stopMonitor(); }

  // ── Load existing records ──────────────────────────────────────────────────
  load() {
    this.loading = true;
    this.svc.getByDoctor(this.doctorId).subscribe({
      next: d => { this.records = d; this.loading = false; },
      error: () => this.loading = false
    });
  }

  // ── Load real patients from the application (via doctor's appointments) ────
  loadPatients() {
    this.loadingPatients = true;
    this.http.get<any[]>(`http://localhost:8088/appointement/doctor/${this.doctorId}`).subscribe({
      next: appointments => {
        // Deduplicate by userId, keep name
        const seen = new Set<number>();
        const result: PatientOption[] = [];
        for (const apt of appointments) {
          if (apt.userId && !seen.has(apt.userId)) {
            seen.add(apt.userId);
            result.push({ id: apt.userId, name: apt.patientName || `Patient #${apt.userId}` });
          }
        }
        this.patients = result;
        this.loadingPatients = false;
      },
      error: () => { this.loadingPatients = false; }
    });
  }

  // ── Called when patient is selected/changed ────────────────────────────────
  onPatientSelected() {
    if (!this.selectedPatient) {
      this.stopMonitor();
      return;
    }
    // Automatically create cards and begin tracking when a patient is selected
    if (!this.monitoring) {
      this.startMonitor();
    }
  }

  // ── Computed ────────────────────────────────────────────────────────────────
  get filteredRecords(): ChronicConditionResponse[] {
    let result = this.records;
    if (this.activeFilter !== 'ALL') {
      result = result.filter(r => r.severity === this.activeFilter || r.conditionType === this.activeFilter);
    }
    if (this.searchQuery?.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(r => r.patientName?.toLowerCase().includes(q));
    }
    return result;
  }

  countBySeverity(s: string) { return this.records.filter(r => r.severity === s).length; }

  // ── Smartwatch monitoring ───────────────────────────────────────────────────
  startMonitor() {
    if (!this.selectedPatient || this.monitoring) return;
    this.monitoring = true;
    this.emailsSent = { WARNING: false, CRITICAL: false };
    this.liveVitals.forEach(v => {
      v.value = null;
      v.value2 = null;
      v.severity = '';
      v.previousSeverity = '';  // Reset previous severity
    });
    // Save all vital types at start of monitoring
    this.saveAllVitalTypes();
    this.monitorInterval = setInterval(() => this.simulateTick(), 3000);
    this.simulateTick();
  }

  stopMonitor() {
    this.monitoring = false;
    if (this.monitorInterval) { clearInterval(this.monitorInterval); this.monitorInterval = null; }
  }

  private simulateTick() {
    for (const v of this.liveVitals) {
      const { val, val2 } = this.generateReading(v.type);
      v.value = val;
      if (v.type === 'BLOOD_PRESSURE') v.value2 = val2 ?? null;

      const newSeverity = this.computeSeverity(v.type, val, val2);
      const severityChanged = newSeverity !== v.severity;

      v.previousSeverity = v.severity;
      v.severity = newSeverity;

      // Fire alert for WARNING and CRITICAL
      if (v.severity !== 'NORMAL') {
        this.fireAlert(v, val, val2);

        // Send email only for the FIRST warning and FIRST critical reading
        if (v.severity === 'WARNING' && !this.emailsSent.WARNING) {
          this.sendAlertEmail(v, val, val2, 'WARNING');
          this.emailsSent.WARNING = true;
        } else if (v.severity === 'CRITICAL' && !this.emailsSent.CRITICAL) {
          this.sendAlertEmail(v, val, val2, 'CRITICAL');
          this.emailsSent.CRITICAL = true;
        }
      }

      // Save whenever severity changes
      if (severityChanged && newSeverity !== '') {
        this.autoSave(v, val, val2, v.previousSeverity);
      }
    }
  }

  private generateReading(type: string): { val: number; val2?: number } {
    // ~75% NORMAL, ~18% WARNING, ~7% CRITICAL
    const roll = Math.random();
    switch (type) {
      case 'BLOOD_SUGAR':
        if (roll < 0.04) return { val: Math.round(55 + Math.random() * 14) };   // critical low
        if (roll < 0.07) return { val: Math.round(130 + Math.random() * 40) };  // critical high
        if (roll < 0.22) return { val: Math.round(100 + Math.random() * 25) };  // warning
        return { val: Math.round(75 + Math.random() * 24) };                     // normal

      case 'BLOOD_PRESSURE':
        if (roll < 0.04) return { val: Math.round(145 + Math.random() * 25), val2: Math.round(95 + Math.random() * 15) };
        if (roll < 0.07) return { val: Math.round(80 + Math.random() * 9), val2: Math.round(50 + Math.random() * 10) };
        if (roll < 0.22) return { val: Math.round(121 + Math.random() * 18), val2: Math.round(80 + Math.random() * 14) };
        return { val: Math.round(100 + Math.random() * 19), val2: Math.round(65 + Math.random() * 14) };

      case 'OXYGEN_SATURATION':
        if (roll < 0.04) return { val: Math.round(85 + Math.random() * 4) };    // critical
        if (roll < 0.18) return { val: Math.round(90 + Math.random() * 4) };    // warning
        return { val: Math.round(96 + Math.random() * 3) };                      // normal

      case 'HEART_RATE':
        if (roll < 0.03) return { val: Math.round(125 + Math.random() * 25) };  // critical high
        if (roll < 0.06) return { val: Math.round(35 + Math.random() * 4) };   // critical low
        if (roll < 0.22) return { val: Math.round(101 + Math.random() * 18) };  // warning
        return { val: Math.round(62 + Math.random() * 36) };                     // normal

      default: return { val: 0 };
    }
  }

  private fireAlert(v: LiveVital, val: number, val2?: number) {
    const displayVal = v.type === 'BLOOD_PRESSURE' && val2 ? `${val}/${val2} mmHg` : `${val} ${v.unit}`;
    const msg = this.buildAlertMessage(v.type, v.severity, val);
    const toast: AlertToast = {
      id: ++this.alertIdCounter,
      severity: v.severity,
      message: msg,
      patientName: this.selectedPatient!.name,
      type: v.label,
      value: displayVal
    };
    this.alerts.unshift(toast);
    if (this.alerts.length > 5) this.alerts = this.alerts.slice(0, 5);
    setTimeout(() => this.dismissAlert(toast.id), 7000);
  }

  private sendAlertEmail(v: LiveVital, val: number, val2: number | undefined | null, level: string) {
    if (!this.selectedPatient) return;
    const displayVal = v.type === 'BLOOD_PRESSURE' && val2 ? `${val}/${val2} mmHg` : `${val} ${v.unit}`;
    const msg = this.buildAlertMessage(v.type, level, val);

    const payload = {
      patientId: this.selectedPatient.id.toString(),
      patientName: this.selectedPatient.name,
      vitalType: v.label,
      value: displayVal,
      message: msg
    };

    this.http.post('http://localhost:8088/api/chronic/warn-email', payload).subscribe({
      next: () => console.log(`${level} email sent to patient successfully`),
      error: err => console.error(`Failed to send ${level} email`, err)
    });
  }

  private buildAlertMessage(type: string, severity: string, val: number): string {
    const prefix = severity === 'CRITICAL' ? '' : '⚠️ Warning: ';
    switch (type) {
      case 'BLOOD_SUGAR':
        return prefix + (val < 70 ? 'Hypoglycemia — blood sugar critically low!' : 'Hyperglycemia — blood sugar critically high!');
      case 'BLOOD_PRESSURE':
        return prefix + (val >= 140 ? 'Hypertension — dangerously high blood pressure!' : 'Hypotension — dangerously low blood pressure!');
      case 'OXYGEN_SATURATION':
        return prefix + 'Hypoxia — oxygen saturation low! Risk of suffocation!';
      case 'HEART_RATE':
        return prefix + (val > 120 ? 'Tachycardia — heart rate too high!' : 'Bradycardia — heart rate too low!');
      default: return 'Abnormal reading detected.';
    }
  }

  /** Auto-save readings to DB whenever severity changes */
  private autoSave(v: LiveVital, val: number, val2?: number, previousSeverity?: string) {
    if (!this.selectedPatient) return;

    // Build note with severity transition info
    let notes = `[Smartwatch] Reading recorded`;
    if (previousSeverity && previousSeverity !== v.severity) {
      notes = `[Smartwatch] Severity changed: ${previousSeverity || 'INITIAL'} → ${v.severity}`;
    }

    const req: ChronicConditionRequest = {
      patientId: this.selectedPatient.id,
      patientName: this.selectedPatient.name,
      doctorId: this.doctorId,
      conditionType: v.type,
      value: val,
      value2: val2,
      notes: notes,
      recordedAt: this.nowDatetime()
    };
    this.svc.create(req).subscribe({
      next: () => this.load(),
      error: () => { }
    });
  }

  dismissAlert(id: number) { this.alerts = this.alerts.filter(a => a.id !== id); }

  deleteRecord(id: number) {
    if (!confirm('Delete this reading?')) return;
    this.svc.delete(id).subscribe({ next: () => this.load() });
  }

  /** Save all 4 vital card types when patient is selected/changed */
  private saveAllVitalTypes() {
    if (!this.selectedPatient) return;

    // Save each vital type as a baseline record
    for (const vital of this.liveVitals) {
      const req: ChronicConditionRequest = {
        patientId: this.selectedPatient.id,
        patientName: this.selectedPatient.name,
        doctorId: this.doctorId,
        conditionType: vital.type,
        value: vital.value || 0,  // Use current value or 0 as baseline
        value2: vital.value2 ?? undefined,
        notes: `[Patient Selected] Vital type card saved for patient monitoring`,
        recordedAt: this.nowDatetime()
      };
      this.svc.create(req).subscribe({
        next: () => {
          // Record saved, no action needed
        },
        error: () => { }
      });
    }

    // Reload records after saving all types
    setTimeout(() => this.load(), 500);
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────
  vitalCardClass(v: LiveVital): string {
    if (!v.severity || v.value === null) return 'bg-slate-800/60 border-slate-700';
    return ({
      CRITICAL: 'bg-red-900/50 border-red-500 shadow-red-500/20 shadow-lg',
      WARNING: 'bg-yellow-900/40 border-yellow-500',
      NORMAL: 'bg-green-900/30 border-green-600/50',
    } as any)[v.severity] ?? 'bg-slate-800/60 border-slate-700';
  }

  severityChip(s: string): string {
    return ({
      CRITICAL: 'bg-red-500 text-white',
      WARNING: 'bg-yellow-500 text-black',
      NORMAL: 'bg-green-500 text-white',
    } as any)[s] ?? 'bg-slate-600 text-slate-300';
  }

  alertClass(s: string): string {
    return s === 'CRITICAL'
      ? 'bg-red-700 border-red-500 text-white'
      : 'bg-yellow-600 border-yellow-400 text-white';
  }

  computeSeverity(type: string, v: number, v2?: number): string {
    switch (type) {
      case 'BLOOD_SUGAR': return v < 70 || v >= 126 ? 'CRITICAL' : v >= 100 ? 'WARNING' : 'NORMAL';
      case 'BLOOD_PRESSURE': return v < 90 || v >= 140 ? 'CRITICAL' : v >= 120 ? 'WARNING' : 'NORMAL';
      case 'OXYGEN_SATURATION': return v < 90 ? 'CRITICAL' : v < 95 ? 'WARNING' : 'NORMAL';
      case 'HEART_RATE': return v < 40 || v > 120 ? 'CRITICAL' : v < 60 || v > 100 ? 'WARNING' : 'NORMAL';
      default: return 'NORMAL';
    }
  }

  criticalMessage(r: ChronicConditionResponse): string {
    switch (r.conditionType) {
      case 'BLOOD_SUGAR': return r.value < 70 ? 'Hypoglycemia — low blood sugar!' : 'Hyperglycemia — high blood sugar!';
      case 'BLOOD_PRESSURE': return r.value >= 140 ? 'Hypertension — high blood pressure!' : 'Hypotension — low blood pressure!';
      case 'OXYGEN_SATURATION': return 'Hypoxia — risk of suffocation!';
      case 'HEART_RATE': return r.value > 120 ? 'Tachycardia — heart rate too high!' : 'Bradycardia — heart rate too low!';
      default: return '';
    }
  }

  conditionIcon(t: string) { return ({ BLOOD_SUGAR: '🩸', BLOOD_PRESSURE: '💓', OXYGEN_SATURATION: '🫁', HEART_RATE: '❤️' } as any)[t] ?? '📊'; }
  conditionLabel(t: string) { return ({ BLOOD_SUGAR: 'Blood Sugar', BLOOD_PRESSURE: 'Blood Pressure', OXYGEN_SATURATION: 'Oxygen Saturation', HEART_RATE: 'Heart Rate' } as any)[t] ?? t; }
  borderColor(s: string) { return ({ CRITICAL: 'border-red-500', WARNING: 'border-yellow-400', NORMAL: 'border-green-400' } as any)[s] ?? ''; }
  iconBg(s: string) { return ({ CRITICAL: 'bg-red-100', WARNING: 'bg-yellow-100', NORMAL: 'bg-green-100' } as any)[s] ?? 'bg-gray-100'; }
  severityBadge(s: string) { return ({ CRITICAL: 'bg-red-100 text-red-700', WARNING: 'bg-yellow-100 text-yellow-700', NORMAL: 'bg-green-100 text-green-700' } as any)[s] ?? ''; }
  severityBadgeBlock(s: string) { return ({ CRITICAL: 'bg-red-100 text-red-700', WARNING: 'bg-yellow-100 text-yellow-700', NORMAL: 'bg-green-100 text-green-700' } as any)[s] ?? 'bg-gray-100 text-gray-700'; }
  severityText(s: string) { return ({ CRITICAL: 'text-red-600', WARNING: 'text-yellow-600', NORMAL: 'text-green-600' } as any)[s] ?? ''; }
  severityIcon(s: string) { return ({ CRITICAL: '🚨', WARNING: '⚠️', NORMAL: '✅' } as any)[s] ?? ''; }
  formatDate(d: string) { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  nowDatetime() { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().substring(0, 16); }

  /** Returns '↑ HIGH', '↓ LOW', or '' for NORMAL readings */
  vitalDirection(v: LiveVital): string {
    if (v.value === null || v.severity === 'NORMAL') return '';
    const val = v.value;
    switch (v.type) {
      case 'BLOOD_SUGAR':
        return val < 70 ? '↓ LOW (Hypoglycemia)' : '↑ HIGH (Hyperglycemia)';
      case 'BLOOD_PRESSURE':
        return val >= 120 ? '↑ HIGH (Hypertension)' : '↓ LOW (Hypotension)';
      case 'OXYGEN_SATURATION':
        return '↓ LOW (Hypoxia)';
      case 'HEART_RATE':
        return val > 100 ? '↑ HIGH (Tachycardia)' : '↓ LOW (Bradycardia)';
      default: return '';
    }
  }
}
