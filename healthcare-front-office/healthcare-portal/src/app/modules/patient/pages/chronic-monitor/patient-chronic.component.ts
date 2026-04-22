import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, ViewChildren, QueryList, ChangeDetectorRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip, Legend
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

// ─── Types ───────────────────────────────────────────────────────────────────

interface VitalConfig {
  type: string;
  icon: string;
  label: string;
  unit: string;
  color: string;
  colorAlpha: string;
  value: number | null;
  value2?: number | null;
  severity: string;
  history: number[];
  labels: string[];
}

interface SavedSession {
  id: string;
  startedAt: string;
  duration: number;          // seconds
  readings: number;
  snapshots: { [type: string]: number[] };
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-patient-chronic',
  template: `
<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 space-y-6">

  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <div class="flex items-center justify-between flex-wrap gap-4">
    <div>
      <h1 class="text-3xl font-extrabold text-black tracking-tight">🩺 Health Monitor</h1>
      <p class="text-slate-400 text-sm mt-1">
        Smartwatch simulator · Real-time vitals · Live charts
      </p>
    </div>

    <!-- Live badge -->
    <div class="flex items-center gap-3">
      <span *ngIf="monitoring"
        class="flex items-center gap-2 bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-1.5 rounded-full text-sm font-bold">
        <span class="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping inline-block"></span>
        LIVE · {{tickCount}} readings
      </span>
      <span *ngIf="!monitoring && tickCount > 0"
        class="flex items-center gap-2 bg-slate-700/60 border border-slate-600 text-slate-300 px-4 py-1.5 rounded-full text-sm">
        ⏹ Paused · {{tickCount}} readings recorded
      </span>
    </div>
  </div>

  <!-- ── Simulator Control Panel ─────────────────────────────────────────── -->
  <div class="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-5 shadow-2xl">
    <div class="flex items-center justify-between flex-wrap gap-4">

      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">⌚</div>
        <div>
          <h2 class="text-black font-bold text-lg">Smartwatch Simulator</h2>
          <p class="text-slate-400 text-xs">New reading every 3 seconds · All 4 vitals simultaneously</p>
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <!-- Speed control -->
        <div *ngIf="!monitoring" class="flex items-center gap-2">
          <label class="text-slate-400 text-xs">Speed:</label>
          <select [(ngModel)]="tickInterval"
            class="bg-slate-700 border border-slate-600 text-black text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option [value]="1000">1 s (Fast)</option>
            <option [value]="3000">3 s (Normal)</option>
            <option [value]="5000">5 s (Slow)</option>
          </select>
        </div>

        <!-- Scenario preset -->
        <div *ngIf="!monitoring" class="flex items-center gap-2">
          <label class="text-slate-400 text-xs">Scenario:</label>
          <select [(ngModel)]="scenario"
            class="bg-slate-700 border border-slate-600 text-black text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="normal">Healthy 😊</option>
            <option value="stress">Stress 😰</option>
            <option value="diabetic">Diabetic ⚠️</option>
            <option value="critical">Critical 🚨</option>
          </select>
        </div>

        <button *ngIf="!monitoring" (click)="startMonitor()"
          class="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2">
          ▶ Start
        </button>
        <button *ngIf="monitoring" (click)="stopMonitor()"
          class="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2">
          ⏹ Stop
        </button>
        <button *ngIf="!monitoring && tickCount > 0" (click)="saveSession()"
          class="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-black font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2">
          💾 Save Session
        </button>
        <button *ngIf="!monitoring && tickCount > 0" (click)="resetSession()"
          class="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-black font-bold rounded-xl text-sm transition-all flex items-center gap-2">
          🔄 Reset
        </button>
      </div>
    </div>

    <!-- Save feedback -->
    <div *ngIf="saveMsg"
      class="mt-4 flex items-center gap-2 bg-violet-900/40 border border-violet-500/50 text-violet-200 px-4 py-2 rounded-xl text-sm">
      ✅ {{saveMsg}}
    </div>
  </div>

  <!-- ── Vital Cards + Charts ────────────────────────────────────────────── -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div *ngFor="let v of vitals; let i = index"
      [class]="'rounded-2xl border p-5 shadow-xl transition-all duration-500 ' + cardClass(v)">

      <!-- Card Header -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <span class="text-3xl">{{v.icon}}</span>
          <div>
            <p class="text-black font-bold text-sm">{{v.label}}</p>
            <p class="text-slate-400 text-xs">{{v.unit}}</p>
          </div>
        </div>
        <span [class]="'text-xs font-bold px-3 py-1 rounded-full ' + chipClass(v.severity)">
          {{v.severity || '— —'}}
        </span>
      </div>

      <!-- Big value -->
      <div class="mb-4">
        <p class="text-5xl font-black text-black leading-none">
          <span *ngIf="v.value !== null">
            {{v.value}}<span *ngIf="v.value2 !== null && v.value2 !== undefined" class="text-3xl text-slate-300">/{{v.value2}}</span>
          </span>
          <span *ngIf="v.value === null" class="text-slate-600 text-3xl">Waiting…</span>
        </p>
        <p *ngIf="vitalDir(v)" [class]="'text-sm font-semibold mt-1 ' + (vitalDir(v).startsWith('↑') ? 'text-red-400' : 'text-sky-400')">
          {{vitalDir(v)}}
        </p>
      </div>

      <!-- Chart canvas -->
      <div class="relative h-40">
        <canvas [id]="'chart-' + v.type" class="w-full h-full"></canvas>
        <p *ngIf="v.history.length === 0" class="absolute inset-0 flex items-center justify-center text-slate-600 text-xs">
          Start monitoring to see the curve
        </p>
      </div>

      <!-- Mini stats -->
      <div *ngIf="v.history.length > 0" class="grid grid-cols-3 gap-2 mt-3 text-center">
        <div class="bg-slate-900/50 rounded-xl py-1.5">
          <p class="text-slate-400 text-[10px]">MIN</p>
          <p class="text-black text-sm font-bold">{{minVal(v)}}</p>
        </div>
        <div class="bg-slate-900/50 rounded-xl py-1.5">
          <p class="text-slate-400 text-[10px]">AVG</p>
          <p class="text-black text-sm font-bold">{{avgVal(v)}}</p>
        </div>
        <div class="bg-slate-900/50 rounded-xl py-1.5">
          <p class="text-slate-400 text-[10px]">MAX</p>
          <p class="text-black text-sm font-bold">{{maxVal(v)}}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Saved Sessions ─────────────────────────────────────────────────── -->
  <div *ngIf="savedSessions.length > 0"
    class="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-5 shadow-xl">
    <h2 class="text-black font-bold text-lg mb-4">💾 Saved Sessions</h2>
    <div class="space-y-3">
      <div *ngFor="let s of savedSessions"
        class="bg-slate-900/60 border border-slate-700 rounded-xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-white font-semibold text-sm">Session · {{s.startedAt}}</p>
          <p class="text-slate-400 text-xs mt-0.5">
            {{s.readings}} readings · {{formatDuration(s.duration)}}
          </p>
        </div>
        <div class="flex gap-4 text-xs text-slate-300">
          <span *ngFor="let t of sessionTypes(s)">
            {{iconFor(t)}} avg {{sessionAvg(s, t)}}
          </span>
        </div>
        <button (click)="deleteSession(s.id)"
          class="text-red-400 hover:text-red-300 text-xs px-3 py-1.5 rounded-lg hover:bg-red-900/30 transition">
          🗑 Delete
        </button>
      </div>
    </div>
  </div>

  <!-- ── Email alert notice ──────────────────────────────────────────────── -->
  <div *ngIf="monitoring" class="bg-yellow-900/30 border border-yellow-600/40 rounded-xl p-4 flex items-start gap-3">
    <span class="text-2xl">📧</span>
    <div>
      <p class="text-yellow-300 font-semibold text-sm">Email alerts active</p>
      <p class="text-yellow-400/80 text-xs mt-0.5">You'll receive an email on the first WARNING reading per vital type in this session.</p>
    </div>
  </div>

  <!-- ── History from Database ─────────────────────────────────────────── -->
  <div class="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl shadow-xl overflow-hidden">

    <!-- Section header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <span class="text-xl">📈</span>
        <div>
          <h2 class="text-white font-bold text-base">History Charts</h2>
          <p class="text-slate-400 text-xs">{{historyRecords.length}} readings loaded from database</p>
        </div>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <button (click)="loadHistory()"
          class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5">
          🔄 Refresh
        </button>
        <button *ngIf="historyRecords.length > 0" (click)="saveAllCharts()"
          class="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5">
          💾 Save All Charts
        </button>
        <button *ngIf="historyRecords.length > 0" (click)="deleteAllHistory()"
          class="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5">
          🗑 Delete All History
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="historyLoading" class="flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
      <span class="text-2xl animate-spin">⏳</span> Loading history charts…
    </div>

    <!-- Empty -->
    <div *ngIf="!historyLoading && historyRecords.length === 0"
      class="py-16 text-center text-slate-500 text-sm">
      <p class="text-4xl mb-3">📭</p>
      No history yet — run the simulator then click Refresh.
    </div>

    <!-- 4 History Charts -->
    <div *ngIf="!historyLoading && historyRecords.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
      <div *ngFor="let v of vitals"
        class="bg-slate-900/60 border border-slate-700 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{v.icon}}</span>
            <div>
              <p class="text-white font-bold text-sm">{{v.label}}</p>
              <p class="text-slate-500 text-xs">{{historyCountFor(v.type)}} readings · {{v.unit}}</p>
            </div>
          </div>
          <button (click)="saveOneChart(v.type)"
            class="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg hover:bg-slate-700 transition flex items-center gap-1">
            💾
          </button>
        </div>
        <!-- Canvas -->
        <div class="relative h-44">
          <canvas [id]="'hist-chart-' + v.type" class="w-full h-full"></canvas>
          <p *ngIf="historyCountFor(v.type) === 0"
            class="absolute inset-0 flex items-center justify-center text-slate-600 text-xs">
            No data for this vital
          </p>
        </div>
      </div>
    </div>

  </div>

</div>
`,
  styles: [`
    :host { display: block; }
  `]
})
export class PatientChronicComponent implements OnInit, OnDestroy, AfterViewInit {

  readonly patientId = Number(localStorage.getItem('userId') ?? 0);
  readonly patientName = localStorage.getItem('UserName') ?? 'Patient';
  readonly patientEmail = localStorage.getItem('EmailUserConnect') ?? '';

  monitoring = false;
  tickCount = 0;
  tickInterval = 3000;
  scenario: 'normal' | 'stress' | 'diabetic' | 'critical' = 'normal';
  saveMsg = '';

  private intervalRef: any = null;
  private sessionStart: Date | null = null;
  private warnSent = new Set<string>();
  private charts: { [type: string]: Chart } = {};
  private histCharts: { [type: string]: Chart } = {};

  // ─── Vitals model ─────────────────────────────────────────────────────────

  vitals: VitalConfig[] = [
    { type: 'BLOOD_SUGAR', icon: '🩸', label: 'Blood Sugar', unit: 'mg/dL', color: '#f87171', colorAlpha: 'rgba(248,113,113,0.15)', value: null, severity: '', history: [], labels: [] },
    { type: 'BLOOD_PRESSURE', icon: '💓', label: 'Blood Pressure', unit: 'mmHg', color: '#fb923c', colorAlpha: 'rgba(251,146,60,0.15)', value: null, value2: null, severity: '', history: [], labels: [] },
    { type: 'OXYGEN_SATURATION', icon: '🫁', label: 'Oxygen Saturation', unit: '%', color: '#38bdf8', colorAlpha: 'rgba(56,189,248,0.15)', value: null, severity: '', history: [], labels: [] },
    { type: 'HEART_RATE', icon: '❤️', label: 'Heart Rate', unit: 'bpm', color: '#a78bfa', colorAlpha: 'rgba(167,139,250,0.15)', value: null, severity: '', history: [], labels: [] },
  ];

  // ─── Saved sessions ───────────────────────────────────────────────────────

  savedSessions: SavedSession[] = [];

  // ─── History from DB ──────────────────────────────────────────────────────

  historyRecords: any[] = [];
  historyLoading = false;
  historyFilter = '';

  get filteredHistory(): any[] {
    const all = this.historyFilter
      ? this.historyRecords.filter(r => r.conditionType === this.historyFilter)
      : this.historyRecords;
    return all.slice(0, 200);
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadSavedSessions();
    this.loadHistory();
  }

  ngAfterViewInit() {
    // Build charts once DOM is ready
    setTimeout(() => this.initCharts(), 100);
  }

  ngOnDestroy() {
    this.stopMonitor();
    Object.values(this.charts).forEach(c => c.destroy());
    Object.values(this.histCharts).forEach(c => c.destroy());
  }

  // ─── Chart init ───────────────────────────────────────────────────────────

  private initCharts() {
    for (const v of this.vitals) {
      const canvas = document.getElementById('chart-' + v.type) as HTMLCanvasElement;
      if (!canvas) continue;
      if (this.charts[v.type]) { this.charts[v.type].destroy(); }

      this.charts[v.type] = new Chart(canvas, {
        type: 'line',
        data: {
          labels: v.labels,
          datasets: [{
            data: v.history,
            borderColor: v.color,
            backgroundColor: v.colorAlpha,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: v.color,
            tension: 0.4,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: { display: false }, tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} ${v.unit}`
              }
            }
          },
          scales: {
            x: {
              display: true,
              ticks: {
                color: '#94a3b8',
                font: { size: 9 },
                maxTicksLimit: 6,
                maxRotation: 45,
                minRotation: 30
              },
              grid: { color: 'rgba(255,255,255,0.03)' }
            },
            y: {
              display: true,
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 4 }
            }
          }
        }
      });
    }
  }

  // ─── Monitor controls ─────────────────────────────────────────────────────

  startMonitor() {
    this.monitoring = true;
    this.sessionStart = new Date();
    this.warnSent.clear();
    this.intervalRef = setInterval(() => this.tick(), this.tickInterval);
    this.tick();
  }

  stopMonitor() {
    this.monitoring = false;
    if (this.intervalRef) { clearInterval(this.intervalRef); this.intervalRef = null; }
  }

  resetSession() {
    this.tickCount = 0;
    this.vitals.forEach(v => {
      v.value = null; v.value2 = null; v.severity = '';
      v.history = []; v.labels = [];
    });
    this.initCharts();
  }

  // ─── Tick ─────────────────────────────────────────────────────────────────

  private tick() {
    this.tickCount++;
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const MAX_POINTS = 40;

    for (const v of this.vitals) {
      const { val, val2 } = this.generate(v.type);
      v.value = val;
      v.value2 = val2 ?? null;
      v.severity = this.severity(v.type, val, val2);

      // Push to history
      v.history.push(val);
      v.labels.push(timeLabel);
      if (v.history.length > MAX_POINTS) { v.history.shift(); v.labels.shift(); }

      // Update chart live
      const chart = this.charts[v.type];
      if (chart) {
        chart.data.labels = [...v.labels];
        chart.data.datasets[0].data = [...v.history];
        chart.update('none');   // no animation for speed
      }

      // Warning email (once per type per session)
      if (v.severity === 'WARNING' && !this.warnSent.has(v.type)) {
        this.warnSent.add(v.type);
        this.sendWarningEmail(v, val, val2);
      }

      // ── Save reading to database ──────────────────────────────────────
      this.saveReading(v, val, val2, timeLabel);
    }
    this.cdr.detectChanges();
  }

  /** POST one vital reading to the backend for persistence */
  private saveReading(v: VitalConfig, val: number, val2: number | undefined, timeLabel: string) {
    const body = {
      patientId: this.patientId,
      patientName: this.patientName,
      doctorId: null,
      conditionType: v.type,
      value: val,
      value2: val2 ?? null,
      notes: `Simulator · scenario=${this.scenario}`,
      recordedAt: new Date().toISOString()
    };
    this.http.post('http://localhost:8088/api/chronic', body)
      .subscribe({ error: () => { } });   // fire-and-forget
  }

  // ─── Simulator / scenarios ────────────────────────────────────────────────

  private generate(type: string): { val: number; val2?: number } {
    const s = this.scenario;
    switch (type) {
      case 'BLOOD_SUGAR':
        if (s === 'diabetic') return { val: Math.round(130 + Math.random() * 60) };
        if (s === 'critical') return { val: Math.round(55 + Math.random() * 15) };
        if (s === 'stress') return { val: Math.round(105 + Math.random() * 30) };
        return this.randChoice([
          { val: Math.round(75 + Math.random() * 24) },           // 70% normal
          { val: Math.round(100 + Math.random() * 25) },          // 20% warning
          { val: Math.round(55 + Math.random() * 13) },           // 10% critical
        ], [0.70, 0.20, 0.10]);

      case 'BLOOD_PRESSURE':
        if (s === 'stress') return { val: Math.round(130 + Math.random() * 20), val2: Math.round(85 + Math.random() * 15) };
        if (s === 'critical') return { val: Math.round(160 + Math.random() * 20), val2: Math.round(100 + Math.random() * 15) };
        return this.randChoice([
          { val: Math.round(105 + Math.random() * 14), val2: Math.round(68 + Math.random() * 11) },
          { val: Math.round(122 + Math.random() * 16), val2: Math.round(80 + Math.random() * 10) },
          { val: Math.round(150 + Math.random() * 20), val2: Math.round(95 + Math.random() * 15) },
        ], [0.70, 0.20, 0.10]);

      case 'OXYGEN_SATURATION':
        if (s === 'critical') return { val: Math.round(85 + Math.random() * 4) };
        if (s === 'stress') return { val: Math.round(92 + Math.random() * 3) };
        return this.randChoice([
          { val: Math.round(96 + Math.random() * 3) },
          { val: Math.round(91 + Math.random() * 4) },
          { val: Math.round(85 + Math.random() * 4) },
        ], [0.78, 0.16, 0.06]);

      case 'HEART_RATE':
        if (s === 'stress') return { val: Math.round(100 + Math.random() * 30) };
        if (s === 'critical') return { val: Math.round(130 + Math.random() * 30) };
        return this.randChoice([
          { val: Math.round(62 + Math.random() * 36) },
          { val: Math.round(101 + Math.random() * 18) },
          { val: Math.round(130 + Math.random() * 20) },
        ], [0.72, 0.20, 0.08]);

      default: return { val: 0 };
    }
  }

  private randChoice<T>(options: T[], weights: number[]): T {
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < options.length; i++) {
      acc += weights[i];
      if (r < acc) return options[i];
    }
    return options[options.length - 1];
  }

  // ─── Severity ─────────────────────────────────────────────────────────────

  severity(type: string, v: number, v2?: number): string {
    switch (type) {
      case 'BLOOD_SUGAR': return v < 70 || v >= 126 ? 'CRITICAL' : v >= 100 ? 'WARNING' : 'NORMAL';
      case 'BLOOD_PRESSURE': return v < 90 || v >= 140 ? 'CRITICAL' : v >= 120 ? 'WARNING' : 'NORMAL';
      case 'OXYGEN_SATURATION': return v < 90 ? 'CRITICAL' : v < 95 ? 'WARNING' : 'NORMAL';
      case 'HEART_RATE': return v < 40 || v > 120 ? 'CRITICAL' : v < 60 || v > 100 ? 'WARNING' : 'NORMAL';
      default: return 'NORMAL';
    }
  }

  // ─── Warning email ────────────────────────────────────────────────────────

  private sendWarningEmail(v: VitalConfig, val: number, val2?: number) {
    if (!this.patientEmail) return;
    const display = v.type === 'BLOOD_PRESSURE' && val2 ? `${val}/${val2} ${v.unit}` : `${val} ${v.unit}`;
    const msg = this.alertMsg(v.type, val);
    this.http.post('http://localhost:8088/api/chronic/warn-email', {
      to: this.patientEmail, patientName: this.patientName,
      vitalType: v.label, value: display, message: msg
    }).subscribe({ error: () => { } });
  }

  private alertMsg(type: string, val: number): string {
    switch (type) {
      case 'BLOOD_SUGAR': return val < 70 ? 'Blood sugar is LOW (Hypoglycemia). Eat something sweet.' : 'Blood sugar is HIGH (Hyperglycemia). Drink water and rest.';
      case 'BLOOD_PRESSURE': return val >= 140 ? 'Blood pressure is HIGH. Rest and avoid salt.' : 'Blood pressure is LOW. Sit down and hydrate.';
      case 'OXYGEN_SATURATION': return 'Oxygen level is LOW. Breathe deeply or seek fresh air.';
      case 'HEART_RATE': return val > 100 ? 'Heart rate is too FAST. Sit and breathe slowly.' : 'Heart rate is too SLOW. Avoid sudden movements.';
      default: return 'Abnormal reading detected.';
    }
  }

  // ─── Save / Load sessions ─────────────────────────────────────────────────

  saveSession() {
    if (!this.sessionStart || this.tickCount === 0) return;
    const duration = Math.round((Date.now() - this.sessionStart.getTime()) / 1000);
    const snaps: { [type: string]: number[] } = {};
    this.vitals.forEach(v => snaps[v.type] = [...v.history]);

    const session: SavedSession = {
      id: Date.now().toString(),
      startedAt: this.sessionStart.toLocaleString(),
      duration,
      readings: this.tickCount,
      snapshots: snaps
    };
    this.savedSessions.unshift(session);
    localStorage.setItem('tbibi_health_sessions', JSON.stringify(this.savedSessions));
    this.saveMsg = `Session saved — ${this.tickCount} readings over ${this.formatDuration(duration)}.`;
    setTimeout(() => this.saveMsg = '', 4000);
  }

  deleteSession(id: string) {
    this.savedSessions = this.savedSessions.filter(s => s.id !== id);
    localStorage.setItem('tbibi_health_sessions', JSON.stringify(this.savedSessions));
  }

  private loadSavedSessions() {
    try {
      const raw = localStorage.getItem('tbibi_health_sessions');
      this.savedSessions = raw ? JSON.parse(raw) : [];
    } catch { this.savedSessions = []; }
  }

  // ─── Template helpers ─────────────────────────────────────────────────────

  cardClass(v: VitalConfig): string {
    if (!v.severity || v.value === null) return 'bg-slate-800/60 border-slate-700';
    return ({
      CRITICAL: 'bg-red-950/60 border-red-500 shadow-red-500/20 shadow-xl',
      WARNING: 'bg-yellow-950/50 border-yellow-500/70',
      NORMAL: 'bg-slate-800/60 border-slate-700',
    } as any)[v.severity] ?? 'bg-slate-800/60 border-slate-700';
  }

  chipClass(s: string): string {
    return ({
      CRITICAL: 'bg-red-500 text-white',
      WARNING: 'bg-yellow-500 text-black',
      NORMAL: 'bg-green-500 text-white',
    } as any)[s] ?? 'bg-slate-600 text-slate-300';
  }

  vitalDir(v: VitalConfig): string {
    if (v.value === null || v.severity === 'NORMAL') return '';
    switch (v.type) {
      case 'BLOOD_SUGAR': return v.value < 70 ? '↓ LOW (Hypoglycemia)' : '↑ HIGH (Hyperglycemia)';
      case 'BLOOD_PRESSURE': return v.value >= 120 ? '↑ HIGH (Hypertension)' : '↓ LOW (Hypotension)';
      case 'OXYGEN_SATURATION': return '↓ LOW (Hypoxia)';
      case 'HEART_RATE': return v.value > 100 ? '↑ HIGH (Tachycardia)' : '↓ LOW (Bradycardia)';
      default: return '';
    }
  }

  minVal(v: VitalConfig): number { return Math.min(...v.history); }
  maxVal(v: VitalConfig): number { return Math.max(...v.history); }
  avgVal(v: VitalConfig): number { return Math.round(v.history.reduce((a, b) => a + b, 0) / v.history.length); }

  formatDuration(secs: number): string {
    const m = Math.floor(secs / 60), s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  sessionTypes(s: SavedSession): string[] { return Object.keys(s.snapshots); }

  sessionAvg(s: SavedSession, type: string): string {
    const arr = s.snapshots[type];
    if (!arr || arr.length === 0) return '—';
    return String(Math.round(arr.reduce((a, b) => a + b, 0) / arr.length));
  }

  iconFor(type: string): string {
    return ({ BLOOD_SUGAR: '🩸', BLOOD_PRESSURE: '💓', OXYGEN_SATURATION: '🫁', HEART_RATE: '❤️' } as any)[type] ?? '📊';
  }

  // ─── History helpers ──────────────────────────────────────────────────────

  loadHistory() {
    if (!this.patientId) return;
    this.historyLoading = true;
    this.http.get<any[]>(`http://localhost:8088/api/chronic/patient/${this.patientId}`)
      .subscribe({
        next: (data) => {
          // Sort oldest→newest for chart display
          this.historyRecords = (data || []).sort((a, b) =>
            new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
          );
          this.historyLoading = false;
          // Rebuild history charts after data arrives
          setTimeout(() => this.buildHistoryCharts(), 80);
        },
        error: () => { this.historyLoading = false; }
      });
  }

  private buildHistoryCharts() {
    for (const v of this.vitals) {
      const rows = this.historyRecords.filter(r => r.conditionType === v.type);
      const canvas = document.getElementById('hist-chart-' + v.type) as HTMLCanvasElement;
      if (!canvas) continue;

      if (this.histCharts[v.type]) { this.histCharts[v.type].destroy(); }

      const labels = rows.map(r => {
        const d = this.parseRecordedAt(r.recordedAt);
        if (!d || isNaN(d.getTime())) return '??:??';
        const day  = d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${day} ${time}`;
      });
      const values = rows.map(r => Number(r.value));

      this.histCharts[v.type] = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: values,
            borderColor: v.color,
            backgroundColor: v.colorAlpha,
            borderWidth: 2,
            pointRadius: rows.length > 100 ? 0 : 2,   // hide dots when dense
            pointBackgroundColor: v.color,
            tension: 0.4,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 300 },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} ${v.unit}`,
                title: (items) => labels[items[0].dataIndex]
              }
            }
          },
          scales: {
            x: {
              display: true,
              ticks: { color: '#94a3b8', font: { size: 9 }, maxTicksLimit: 8, maxRotation: 45, minRotation: 30 },
              grid: { color: 'rgba(255,255,255,0.03)' }
            },
            y: {
              display: true,
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 4 }
            }
          }
        }
      });
    }
  }

  historyCountFor(type: string): number {
    return this.historyRecords.filter(r => r.conditionType === type).length;
  }

  /** DELETE all history for this patient via the backend */
  deleteAllHistory() {
    if (!this.patientId) return;
    if (!confirm('Delete ALL history readings from the database? This cannot be undone.')) return;
    this.http.delete(`http://localhost:8088/api/chronic/patient/${this.patientId}`)
      .subscribe({
        next: () => {
          // Clear local state
          this.historyRecords = [];
          // Destroy history charts
          Object.values(this.histCharts).forEach(c => c.destroy());
          this.histCharts = {};
        },
        error: (e) => alert('Delete failed: ' + (e?.error || e?.message || 'unknown error'))
      });
  }

  /** Download one history chart as PNG */
  saveOneChart(type: string) {
    const canvas = document.getElementById('hist-chart-' + type) as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `tbibi-${type.toLowerCase()}-history-${new Date().toISOString().slice(0,10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /** Download all 4 history charts as separate PNG files */
  saveAllCharts() {
    for (const v of this.vitals) {
      if (this.historyCountFor(v.type) > 0) {
        setTimeout(() => this.saveOneChart(v.type), 200 * this.vitals.indexOf(v));
      }
    }
  }

  /**
   * Safely parse a recordedAt value that may be:
   *   • an ISO string:  "2026-04-20T23:15:30"  (after @JsonFormat backend fix)
   *   • a Java array:  [2026, 4, 20, 23, 15, 30, 0]  (legacy / unpatched backend)
   */
  parseRecordedAt(dt: any): Date | null {
    if (!dt) return null;
    if (Array.isArray(dt)) {
      // [year, month(1-based), day, hour, minute, second, nano?]
      const [y, mo, d, h, m, s] = dt;
      return new Date(y, mo - 1, d, h ?? 0, m ?? 0, s ?? 0);
    }
    const parsed = new Date(dt);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  formatRecordedAt(dt: any): string {
    if (!dt) return '—';
    const d = this.parseRecordedAt(dt);
    return d ? d.toLocaleString() : String(dt);
  }

  labelFor(type: string): string {
    return ({
      BLOOD_SUGAR: 'Blood Sugar',
      BLOOD_PRESSURE: 'Blood Pressure',
      OXYGEN_SATURATION: 'Oxygen Saturation',
      HEART_RATE: 'Heart Rate'
    } as any)[type] ?? type;
  }
}
