import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ChronicConditionService,
  ChronicConditionRequest,
  ChronicConditionResponse
} from '../../services/chronic-condition.service';

@Component({
  selector: 'app-chronic-disease',
  template: `
<div class="p-6 space-y-6">

  <!-- Header -->
  <div class="flex items-center justify-between flex-wrap gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Chronic Disease Monitor</h1>
      <p class="text-gray-500 text-sm mt-1">Track critical health readings — blood sugar, blood pressure, oxygen & heart rate</p>
    </div>
    <button (click)="openForm()" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2">
      ＋ Add Reading
    </button>
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

    <!-- Patient Name Search -->
    <div class="relative w-full md:w-64">
      <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
      <input type="text" [(ngModel)]="searchQuery" placeholder="Search patient name..."
        class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm placeholder-gray-400" />
    </div>
  </div>

  <!-- Records list -->
  <div *ngIf="loading" class="text-center py-12 text-gray-400">Loading readings…</div>
  <div *ngIf="!loading && filteredRecords.length === 0" class="text-center py-12 text-gray-400">
    No readings yet. Click "Add Reading" to log the first one.
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
        <button (click)="openEdit(r)" class="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-sm hover:bg-blue-50">✏️ Edit</button>
        <button (click)="deleteRecord(r.id)" class="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">🗑️ Delete</button>
      </div>
    </div>
  </div>

  <!-- Add / Edit Modal -->
  <div *ngIf="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
      <h2 class="text-xl font-bold text-gray-900 mb-6">{{editId ? 'Edit Reading' : 'New Health Reading'}}</h2>

      <!-- Condition Type -->
      <label class="block text-sm font-medium text-gray-700 mb-1">Condition Type</label>
      <select [(ngModel)]="form.conditionType" (change)="livePreview()"
        class="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-blue-400 outline-none">
        <option value="">— Select type —</option>
        <option value="BLOOD_SUGAR">🩸 Blood Sugar</option>
        <option value="BLOOD_PRESSURE">💓 Blood Pressure</option>
        <option value="OXYGEN_SATURATION">🫁 Oxygen Saturation</option>
        <option value="HEART_RATE">❤️ Heart Rate</option>
      </select>

      <!-- Patient Name -->
      <label class="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
      <input type="text" [(ngModel)]="form.patientName" placeholder="e.g. John Doe"
        class="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-blue-400 outline-none" />


      <!-- Value -->
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{form.conditionType === 'BLOOD_PRESSURE' ? 'Systolic (mmHg)' : 'Value (' + unitLabel() + ')'}}
      </label>
      <input type="number" [(ngModel)]="form.value" (input)="livePreview()" step="0.1"
        class="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-blue-400 outline-none" />

      <!-- Diastolic (only for BP) -->
      <div *ngIf="form.conditionType === 'BLOOD_PRESSURE'">
        <label class="block text-sm font-medium text-gray-700 mb-1">Diastolic (mmHg)</label>
        <input type="number" [(ngModel)]="form.value2"
          class="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-blue-400 outline-none" />
      </div>

      <!-- Live severity preview -->
      <div *ngIf="previewSeverity" [class]="'rounded-xl px-4 py-3 mb-4 font-semibold text-sm flex items-center gap-2 ' + severityBadgeBlock(previewSeverity)">
        <span>{{severityIcon(previewSeverity)}}</span>
        Predicted severity: <strong>{{previewSeverity}}</strong>
        <span *ngIf="previewSeverity === 'CRITICAL'" class="ml-1">— Immediate attention required!</span>
      </div>

      <!-- Date & Time -->
      <label class="block text-sm font-medium text-gray-700 mb-1">Date &amp; Time of Reading</label>
      <input type="datetime-local" [(ngModel)]="form.recordedAt"
        class="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-blue-400 outline-none" />

      <!-- Notes -->
      <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
      <textarea [(ngModel)]="form.notes" rows="2" placeholder="Additional observations…"
        class="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-6 focus:ring-2 focus:ring-blue-400 outline-none"></textarea>

      <div class="flex gap-3 justify-end">
        <button (click)="closeForm()" class="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button (click)="save()" [disabled]="saving || !form.conditionType || !form.value || !form.patientName"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
          {{saving ? 'Saving…' : (editId ? 'Update' : 'Save Reading')}}
        </button>
      </div>
      <p *ngIf="saveError" class="text-red-600 text-sm mt-2">{{saveError}}</p>
    </div>
  </div>

</div>
`
})
export class ChronicDiseaseComponent implements OnInit {
  readonly doctorId = Number(localStorage.getItem('userId') ?? 0);

  records: ChronicConditionResponse[] = [];
  loading = false;
  activeFilter = 'ALL';
  searchQuery = '';
  showForm = false;
  saving = false;
  saveError = '';
  editId: number | null = null;
  previewSeverity = '';

  form: Partial<ChronicConditionRequest> = { patientId: undefined, patientName: '', conditionType: '', value: undefined, value2: undefined, notes: '', recordedAt: this.nowDatetime() };

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

  constructor(private svc: ChronicConditionService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getByDoctor(this.doctorId).subscribe({
      next: d => { this.records = d; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get filteredRecords(): ChronicConditionResponse[] {
    let result = this.records;
    
    if (this.activeFilter !== 'ALL') {
      result = result.filter(r => r.severity === this.activeFilter || r.conditionType === this.activeFilter);
    }
    
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(r => r.patientName?.toLowerCase().includes(q));
    }
    
    return result;
  }

  countBySeverity(s: string) { return this.records.filter(r => r.severity === s).length; }

  openForm() {
    this.editId = null;
    this.form = { patientId: undefined, patientName: '', conditionType: '', value: undefined, value2: undefined, notes: '', recordedAt: this.nowDatetime() };
    this.previewSeverity = '';
    this.saveError = '';
    this.showForm = true;
  }

  openEdit(r: ChronicConditionResponse) {
    this.editId = r.id;
    // Convert ISO recordedAt to datetime-local format (remove seconds+ms)
    const dt = r.recordedAt ? r.recordedAt.substring(0, 16) : this.nowDatetime();
    this.form = { patientId: r.patientId ?? undefined, patientName: r.patientName, conditionType: r.conditionType, value: r.value, value2: r.value2, notes: r.notes, doctorId: this.doctorId, recordedAt: dt };
    this.previewSeverity = r.severity;
    this.saveError = '';
    this.showForm = true;
  }

  closeForm() { this.showForm = false; }

  livePreview() {
    if (!this.form.conditionType || !this.form.value) { this.previewSeverity = ''; return; }
    this.previewSeverity = this.computeSeverity(this.form.conditionType!, this.form.value!, this.form.value2);
  }

  save() {
    this.saving = true;
    this.saveError = '';
    const req: ChronicConditionRequest = { ...(this.form as ChronicConditionRequest), doctorId: this.doctorId };
    const obs = this.editId ? this.svc.update(this.editId, req) : this.svc.create(req);
    obs.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: e => { this.saving = false; this.saveError = e?.error?.message || 'Failed to save.'; }
    });
  }

  deleteRecord(id: number) {
    if (!confirm('Delete this reading?')) return;
    this.svc.delete(id).subscribe({ next: () => this.load() });
  }

  // ── Severity calc (mirrors backend thresholds) ─────────────────────────────
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

  // ── UI helpers ────────────────────────────────────────────────────────────
  conditionIcon(t: string) { return { BLOOD_SUGAR: '🩸', BLOOD_PRESSURE: '💓', OXYGEN_SATURATION: '🫁', HEART_RATE: '❤️' }[t] ?? '📊'; }
  conditionLabel(t: string) { return { BLOOD_SUGAR: 'Blood Sugar', BLOOD_PRESSURE: 'Blood Pressure', OXYGEN_SATURATION: 'Oxygen Saturation', HEART_RATE: 'Heart Rate' }[t] ?? t; }

  borderColor(s: string) { return { CRITICAL: 'border-red-500', WARNING: 'border-yellow-400', NORMAL: 'border-green-400' }[s] ?? ''; }
  iconBg(s: string) { return { CRITICAL: 'bg-red-100', WARNING: 'bg-yellow-100', NORMAL: 'bg-green-100' }[s] ?? 'bg-gray-100'; }
  severityBadge(s: string) { return { CRITICAL: 'bg-red-100 text-red-700', WARNING: 'bg-yellow-100 text-yellow-700', NORMAL: 'bg-green-100 text-green-700' }[s] ?? ''; }
  severityBadgeBlock(s: string) { return { CRITICAL: 'bg-red-100 text-red-700', WARNING: 'bg-yellow-100 text-yellow-700', NORMAL: 'bg-green-100 text-green-700' }[s] ?? 'bg-gray-100 text-gray-700'; }
  severityText(s: string) { return { CRITICAL: 'text-red-600', WARNING: 'text-yellow-600', NORMAL: 'text-green-600' }[s] ?? ''; }
  severityIcon(s: string) { return { CRITICAL: '🚨', WARNING: '⚠️', NORMAL: '✅' }[s] ?? ''; }

  unitLabel() { return { BLOOD_SUGAR: 'mg/dL', BLOOD_PRESSURE: 'mmHg', OXYGEN_SATURATION: '%', HEART_RATE: 'bpm' }[this.form.conditionType ?? ''] ?? ''; }
  formatDate(d: string) { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  nowDatetime() { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().substring(0, 16); }
}

