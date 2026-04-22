import {
  Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Chart, DoughnutController, ArcElement, Tooltip, Legend, CategoryScale
} from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, CategoryScale);

// ─── Types ────────────────────────────────────────────────────────────────────

interface CarePlanSection {
  title: string;
  subtitle: string;
  tips: string[];
  warningSigns: string[];
}

interface CarePlan {
  headline: string;
  callDoctorNow: boolean;
  sections: CarePlanSection[];
}

interface PatientFeature {
  patientId: number;
  patientName: string;
  avgBloodSugar: number;
  avgBloodPressure: number;
  avgOxygenSaturation: number;
  avgHeartRate: number;
  criticalPct: number;
  warningPct: number;
  totalReadings: number;
  riskScore: number;
  riskCluster: string;
  carePlan: CarePlan | null;
}

interface ClusterGroup {
  label: string;
  color: string;
  icon: string;
  count: number;
  avgRiskScore: number;
  avgCriticalPct: number;
  avgWarningPct: number;
  patients: PatientFeature[];
}

interface SegmentationResponse {
  runAt: string;
  totalPatients: number;
  iterations: number;
  clusters: ClusterGroup[];
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-risk-segmentation',
  template: `
<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 space-y-6">

  <!-- ── Header ──────────────────────────────────────────────────────────── -->
  <div class="flex items-center justify-between flex-wrap gap-4">
    <div>
      <h1 class="text-3xl font-extrabold text-black tracking-tight">🧠 Patient Risk Segmentation</h1>
      <p class="text-slate-400 text-sm mt-1">AI-powered K-Means clustering · Groups patients into LOW / MEDIUM / HIGH risk with personalised care plans</p>
    </div>
    <button (click)="runAnalysis()"
      [disabled]="loading"
      class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-black font-bold rounded-xl text-sm transition shadow-lg flex items-center gap-2">
      <span *ngIf="loading" class="animate-spin">⏳</span>
      <span *ngIf="!loading">⚡</span>
      {{loading ? 'Analysing…' : 'Run AI Analysis'}}
    </button>
  </div>

  <!-- ── Error ────────────────────────────────────────────────────────────── -->
  <div *ngIf="error" class="bg-red-900/40 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm flex items-center gap-3">
    ⚠️ {{error}}
  </div>

  <!-- ── No data yet ──────────────────────────────────────────────────────── -->
  <div *ngIf="!loading && !result && !error"
    class="flex flex-col items-center justify-center py-24 text-slate-500 space-y-4">
    <span class="text-6xl">🔬</span>
    <p class="text-lg font-semibold">Click "Run AI Analysis" to cluster patients</p>
    <p class="text-sm text-slate-600">Requires patients to have chronic condition readings in the database</p>
  </div>

  <!-- ── Results ─────────────────────────────────────────────────────────── -->
  <div *ngIf="result">

    <!-- Meta bar -->
    <div class="bg-slate-800/60 border border-slate-700 rounded-2xl px-6 py-3 flex items-center gap-6 flex-wrap text-sm">
      <span class="text-slate-400">
        🕐 <span class="text-black font-semibold">{{formatDate(result.runAt)}}</span>
      </span>
      <span class="text-slate-400">
        👥 <span class="text-black font-semibold">{{result.totalPatients}}</span> patients analysed
      </span>
      <span class="text-slate-400">
        🔁
        <span class="text-black font-semibold">
          <ng-container *ngIf="result.iterations === 0">Single-patient mode · absolute scoring</ng-container>
          <ng-container *ngIf="result.iterations > 0">K-Means converged in {{result.iterations}} iteration{{result.iterations !== 1 ? 's' : ''}}</ng-container>
        </span>
      </span>
    </div>

    <!-- Doughnut + cluster summary row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">

      <!-- Doughnut chart -->
      <div class="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 flex flex-col items-center">
        <h2 class="text-black font-bold mb-4">Risk Distribution</h2>
        <div class="relative w-52 h-52">
          <canvas id="risk-doughnut"></canvas>
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p class="text-3xl font-black text-black">{{result.totalPatients}}</p>
            <p class="text-slate-400 text-xs">patients</p>
          </div>
        </div>
        <div class="flex gap-4 mt-4">
          <span *ngFor="let c of result.clusters" class="flex items-center gap-1.5 text-xs text-slate-300">
            <span class="w-3 h-3 rounded-full inline-block" [style.background]="c.color"></span>
            {{c.label}} ({{c.count}})
          </span>
        </div>
      </div>

      <!-- 3 cluster stat cards -->
      <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div *ngFor="let c of result.clusters"
          [class]="'rounded-2xl border p-5 shadow-xl ' + clusterCardClass(c.label)">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">{{c.icon}}</span>
            <div>
              <p class="text-black font-extrabold text-lg">{{c.label}}</p>
              <p class="text-slate-400 text-xs">{{c.count}} patient{{c.count !== 1 ? 's' : ''}}</p>
            </div>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Avg Risk Score</span>
              <span class="font-bold text-black">{{pct(c.avgRiskScore)}}</span>
            </div>
            <div class="w-full bg-slate-900/60 rounded-full h-1.5">
              <div class="h-1.5 rounded-full" [style.width]="pct(c.avgRiskScore)" [style.background]="c.color"></div>
            </div>
            <div class="flex justify-between mt-2">
              <span class="text-slate-400">🔴 Critical avg</span>
              <span class="font-bold text-black">{{pct(c.avgCriticalPct)}}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">🟡 Warning avg</span>
              <span class="font-bold text-black">{{pct(c.avgWarningPct)}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Patient lists per cluster -->
    <div class="space-y-5 mt-4">
      <div *ngFor="let c of result.clusters"
        class="bg-slate-800/70 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">

        <!-- Cluster header -->
        <div [class]="'flex items-center justify-between px-6 py-3 border-b border-slate-700 ' + clusterHeaderClass(c.label)">
          <div class="flex items-center gap-3">
            <span class="text-xl">{{c.icon}}</span>
            <h3 class="text-black font-bold">{{c.label}} RISK — {{c.count}} patients</h3>
          </div>
          <span class="text-xs text-slate-400 font-medium">Avg score: {{pct(c.avgRiskScore)}}</span>
        </div>

        <!-- No patients -->
        <div *ngIf="c.patients.length === 0" class="px-6 py-6 text-slate-500 text-sm text-center">
          No patients in this cluster
        </div>

        <!-- Patient rows -->
        <div *ngIf="c.patients.length > 0" class="divide-y divide-slate-700/50">
          <div *ngFor="let p of c.patients">

            <!-- Row summary -->
            <div class="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-700/20 transition cursor-pointer"
                 (click)="togglePlan(p.patientId)">
              <!-- Avatar -->
              <div [class]="'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ' + avatarClass(c.label)">
                {{initials(p.patientName)}}
              </div>
              <!-- Name + readings -->
              <div class="flex-1 min-w-0">
                <p class="text-black font-semibold text-sm truncate">{{p.patientName}}</p>
                <p class="text-slate-500 text-xs">{{p.totalReadings}} readings</p>
              </div>
              <!-- Mini vitals -->
              <div class="hidden md:flex gap-4 text-xs text-slate-400">
                <span title="Blood Sugar">🩸 {{fmt(p.avgBloodSugar)}} mg/dL</span>
                <span title="Blood Pressure">💓 {{fmt(p.avgBloodPressure)}} mmHg</span>
                <span title="SpO2">🫁 {{fmt(p.avgOxygenSaturation)}}%</span>
                <span title="Heart Rate">❤️ {{fmt(p.avgHeartRate)}} bpm</span>
              </div>
              <!-- Risk score bar -->
              <div class="w-28 hidden sm:block">
                <div class="flex justify-between text-xs mb-0.5">
                  <span class="text-slate-500">Risk</span>
                  <span class="text-black font-semibold">{{pct(p.riskScore)}}</span>
                </div>
                <div class="w-full bg-slate-900 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full transition-all"
                    [style.width]="pct(p.riskScore)"
                    [style.background]="c.color">
                  </div>
                </div>
              </div>
              <!-- Critical badge -->
              <span *ngIf="p.criticalPct > 0"
                class="text-xs bg-red-900/50 border border-red-500/50 text-red-300 px-2 py-0.5 rounded-full blackspace-nowrap">
                🔴 {{pct(p.criticalPct)}} critical
              </span>
              <!-- Expand toggle -->
              <span class="text-slate-400 text-xs ml-auto flex-shrink-0">
                {{expandedPlan === p.patientId ? '▲ Hide Plan' : '▼ Care Plan'}}
              </span>
            </div>

            <!-- ── Care Plan Panel ───────────────────────────────────────── -->
            <div *ngIf="expandedPlan === p.patientId && p.carePlan"
              class="px-6 pb-6 pt-4 bg-slate-900/50 border-t border-slate-700/60 space-y-5">

              <!-- Headline / urgency banner -->
              <div [class]="headlineBannerClass(p.riskCluster)">
                <span class="text-xl">{{p.riskCluster === 'HIGH' ? '🚨' : p.riskCluster === 'MEDIUM' ? '⚠️' : '✅'}}</span>
                <div>
                  <p class="font-bold text-sm">{{p.carePlan.headline}}</p>
                  <p *ngIf="p.carePlan.callDoctorNow"
                    class="text-xs mt-1 font-semibold text-red-300">
                    👨‍⚕️ Please contact a doctor as soon as possible.
                  </p>
                </div>
              </div>

              <!-- Sections grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div *ngFor="let sec of p.carePlan.sections"
                  class="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
                  <!-- Section title -->
                  <div>
                    <p class="text-black font-bold text-sm">{{sec.title}}</p>
                    <p class="text-slate-500 text-xs">{{sec.subtitle}}</p>
                  </div>
                  <!-- Tips -->
                  <ul class="space-y-1.5">
                    <li *ngFor="let tip of sec.tips"
                      class="flex items-start gap-2 text-xs text-slate-300">
                      <span class="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                      {{tip}}
                    </li>
                  </ul>
                  <!-- Warning signs -->
                  <div *ngIf="sec.warningSigns.length > 0"
                    class="bg-red-950/40 border border-red-700/40 rounded-lg p-3">
                    <p class="text-red-400 font-semibold text-xs mb-1.5">⚠️ Warning Signs</p>
                    <ul class="space-y-1">
                      <li *ngFor="let w of sec.warningSigns"
                        class="text-xs text-red-300 flex items-start gap-1.5">
                        <span class="flex-shrink-0">•</span>{{w}}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div><!-- end patient row -->
        </div>

      </div>
    </div>

  </div>
</div>
`,
  styles: [`:host { display: block; }`]
})
export class RiskSegmentationComponent implements OnInit, AfterViewInit, OnDestroy {

  result: SegmentationResponse | null = null;
  loading = false;
  error = '';
  expandedPlan: number | null = null;
  private doughnut: Chart | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() { this.runAnalysis(); }
  ngAfterViewInit() { }
  ngOnDestroy() { this.doughnut?.destroy(); }

  runAnalysis() {
    this.loading = true;
    this.error = '';
    this.expandedPlan = null;
    this.http.get<SegmentationResponse>('http://localhost:8088/api/risk-segmentation')
      .subscribe({
        next: (data) => {
          this.result = data;
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.buildDoughnut(), 80);
        },
        error: (e) => {
          this.error = e?.error?.message || 'Failed to reach the segmentation service.';
          this.loading = false;
        }
      });
  }

  togglePlan(patientId: number) {
    this.expandedPlan = this.expandedPlan === patientId ? null : patientId;
  }

  // ── Doughnut chart ─────────────────────────────────────────────────────────

  private buildDoughnut() {
    if (!this.result) return;
    const canvas = document.getElementById('risk-doughnut') as HTMLCanvasElement;
    if (!canvas) return;
    this.doughnut?.destroy();

    const labels = this.result.clusters.map(c => c.label);
    const data = this.result.clusters.map(c => c.count);
    const colors = this.result.clusters.map(c => c.color);

    this.doughnut = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#1e293b' }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} patients` } }
        }
      }
    });
  }

  // ── Template helpers ───────────────────────────────────────────────────────

  headlineBannerClass(cluster: string): string {
    const base = 'flex items-start gap-3 rounded-xl px-4 py-3 border text-sm ';
    return base + ({
      HIGH: 'bg-red-950/60 border-red-500/60 text-red-200',
      MEDIUM: 'bg-yellow-950/50 border-yellow-600/50 text-yellow-200',
      LOW: 'bg-green-950/50 border-green-600/50 text-green-200',
    } as any)[cluster] ?? base + 'bg-slate-800 border-slate-700 text-slate-200';
  }

  clusterCardClass(label: string): string {
    return ({
      LOW: 'bg-green-950/40 border-green-700/50',
      MEDIUM: 'bg-yellow-950/40 border-yellow-700/50',
      HIGH: 'bg-red-950/40 border-red-700/50',
    } as any)[label] ?? 'bg-slate-800/60 border-slate-700';
  }

  clusterHeaderClass(label: string): string {
    return ({
      LOW: 'bg-green-900/20',
      MEDIUM: 'bg-yellow-900/20',
      HIGH: 'bg-red-900/20',
    } as any)[label] ?? '';
  }

  avatarClass(label: string): string {
    return ({
      LOW: 'bg-green-700 text-black',
      MEDIUM: 'bg-yellow-600 text-black',
      HIGH: 'bg-red-700 text-black',
    } as any)[label] ?? 'bg-slate-600 text-black';
  }

  initials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  pct(v: number): string { return Math.round((v ?? 0) * 100) + '%'; }
  fmt(v: number): string { return v ? Math.round(v).toString() : '—'; }

  formatDate(dt: string): string {
    try { return new Date(dt).toLocaleString(); } catch { return dt; }
  }
}
