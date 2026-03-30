import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface LiveVital {
  type: string;
  icon: string;
  label: string;
  unit: string;
  value: number | null;
  value2?: number | null;
  severity: string;
}


@Component({
  selector: 'app-patient-chronic',
  template: `
<div class="p-6 space-y-6">

  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold text-gray-900">My Health Monitor</h1>
    <p class="text-gray-500 text-sm mt-1">Real-time smartwatch vitals — you'll get an email alert on the first warning reading</p>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!-- SMARTWATCH PANEL -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div class="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 shadow-2xl border border-blue-800/40">
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl shadow-lg">⌚</div>
        <div>
          <h2 class="text-black font-bold text-lg">Live Smartwatch Monitor</h2>
          <p class="text-blue-300 text-xs">Streaming vitals every 3 seconds — warnings trigger an email alert</p>
        </div>
        <span *ngIf="monitoring" class="flex items-center gap-1.5 bg-green-500/20 border border-green-500/50 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-ping inline-block"></span>
          LIVE
        </span>
      </div>

      <div class="flex items-center gap-3">
        <button *ngIf="!monitoring" (click)="startMonitor()"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg">
          ▶ Start Monitoring
        </button>
        <button *ngIf="monitoring" (click)="stopMonitor()"
          class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg">
          ⏹ Stop Monitoring
        </button>
      </div>
    </div>

    <!-- Vital cards -->
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

    <p *ngIf="!monitoring" class="text-center text-slate-500 text-sm mt-4">
      Click ▶ Start Monitoring to stream your live vitals.
    </p>
  </div>


  <!-- Info box when monitoring -->
  <div *ngIf="monitoring" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
    <span class="text-2xl">📧</span>
    <div>
      <p class="font-semibold text-yellow-800 text-sm">Email alerts enabled</p>
      <p class="text-yellow-700 text-xs mt-0.5">You will receive an email the first time each vital type reaches WARNING level during this session.</p>
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
export class PatientChronicComponent implements OnInit, OnDestroy {
  readonly patientId = Number(localStorage.getItem('userId') ?? 0);
  readonly patientName = localStorage.getItem('userName') ?? 'Patient';
  readonly patientEmail = localStorage.getItem('userEmail') ?? '';

  monitoring = false;
  private monitorInterval: any = null;
  private warnEmailSent = new Set<string>();

  liveVitals: LiveVital[] = [
    { type: 'BLOOD_SUGAR', icon: '🩸', label: 'Blood Sugar', unit: 'mg/dL', value: null, severity: '' },
    { type: 'BLOOD_PRESSURE', icon: '💓', label: 'Blood Pressure', unit: 'mmHg', value: null, value2: null, severity: '' },
    { type: 'OXYGEN_SATURATION', icon: '🫁', label: 'Oxygen Saturation', unit: '%', value: null, severity: '' },
    { type: 'HEART_RATE', icon: '❤️', label: 'Heart Rate', unit: 'bpm', value: null, severity: '' },
  ];

  constructor(private http: HttpClient) { }
  ngOnInit() { }
  ngOnDestroy() { this.stopMonitor(); }

  startMonitor() {
    this.monitoring = true;
    this.warnEmailSent.clear();
    this.liveVitals.forEach(v => { v.value = null; v.value2 = null; v.severity = ''; });
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
      v.severity = this.computeSeverity(v.type, val, val2);

      if (v.severity === 'WARNING') {
        // Send email only on the FIRST warning per type per session
        if (!this.warnEmailSent.has(v.type)) {
          this.warnEmailSent.add(v.type);
          this.sendWarningEmail(v, val, val2);
        }
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

  private sendWarningEmail(v: LiveVital, val: number, val2?: number) {
    if (!this.patientEmail) return;
    const displayVal = v.type === 'BLOOD_PRESSURE' && val2 ? `${val}/${val2} ${v.unit}` : `${val} ${v.unit}`;
    const direction = this.vitalDirection(v);
    const msg = (direction ? `${direction} — ` : '') + this.buildAlertMessage(v.type, 'WARNING', val);
    this.http.post('http://localhost:8088/api/chronic/warn-email', {
      to: this.patientEmail,
      patientName: this.patientName,
      vitalType: v.label,
      value: displayVal,
      message: msg
    }).subscribe({ error: () => { } });
  }


  private buildAlertMessage(type: string, severity: string, val: number): string {
    const prefix = severity === 'WARNING' ? 'Your ' : '';
    switch (type) {
      case 'BLOOD_SUGAR':
        return prefix + (val < 70 ? 'blood sugar is low (Hypoglycemia). Eat something sweet.' : 'blood sugar is high (Hyperglycemia). Drink water and rest.');
      case 'BLOOD_PRESSURE':
        return prefix + (val >= 140 ? 'blood pressure is high. Rest and avoid salt.' : 'blood pressure is low. Sit down and hydrate.');
      case 'OXYGEN_SATURATION':
        return prefix + 'oxygen level is low. Breathe deeply or seek fresh air.';
      case 'HEART_RATE':
        return prefix + (val > 120 ? 'heart rate is too fast. Sit and breathe slowly.' : 'heart rate is too low. Avoid sudden movements.');
      default: return 'Abnormal reading detected.';
    }
  }

  dismissAlert(id: number) { }

  computeSeverity(type: string, v: number, v2?: number): string {
    switch (type) {
      case 'BLOOD_SUGAR': return v < 70 || v >= 126 ? 'CRITICAL' : v >= 100 ? 'WARNING' : 'NORMAL';
      case 'BLOOD_PRESSURE': return v < 90 || v >= 140 ? 'CRITICAL' : v >= 120 ? 'WARNING' : 'NORMAL';
      case 'OXYGEN_SATURATION': return v < 90 ? 'CRITICAL' : v < 95 ? 'WARNING' : 'NORMAL';
      case 'HEART_RATE': return v < 40 || v > 120 ? 'CRITICAL' : v < 60 || v > 100 ? 'WARNING' : 'NORMAL';
      default: return 'NORMAL';
    }
  }

  vitalCardClass(v: LiveVital): string {
    if (!v.severity || v.value === null) return 'bg-slate-800/60 border-slate-700';
    return ({ CRITICAL: 'bg-red-900/50 border-red-500 shadow-red-500/20 shadow-lg', WARNING: 'bg-yellow-900/40 border-yellow-500', NORMAL: 'bg-green-900/30 border-green-600/50' } as any)[v.severity] ?? 'bg-slate-800/60 border-slate-700';
  }
  severityChip(s: string): string {
    return ({ CRITICAL: 'bg-red-500 text-white', WARNING: 'bg-yellow-500 text-white', NORMAL: 'bg-green-500 text-white' } as any)[s] ?? 'bg-slate-600 text-slate-300';
  }
  alertClass(s: string): string {
    return s === 'CRITICAL' ? 'bg-red-700 border-red-500 text-white' : 'bg-yellow-600 border-yellow-400 text-white';
  }

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
