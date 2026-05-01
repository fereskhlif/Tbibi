import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface DiseaseResult {
  disease: string;
  atRisk: boolean;
  probability: number;
  label: string;
  color: string;
}

interface PredictionResponse {
  predictions: DiseaseResult[];
  overallRisk: string;
  summary: string;
}



@Component({
  selector: 'app-disease-risk',
  standalone: false,
  template: `
<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
  <div class="max-w-4xl mx-auto space-y-6">

    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-extrabold text-black tracking-tight">🔬 Disease Risk Predictor</h1>
      <p class="text-slate-400 text-sm">
        Powered by AI · Vitals automatically loaded from your Smartwatch history
      </p>
    </div>

    <!-- Error -->
    <div *ngIf="error" class="bg-red-900/40 border border-red-500/40 rounded-xl p-4 text-red-300 text-sm">
      ⚠️ {{error}}
    </div>



    <!-- Loading vitals -->
    <div *ngIf="loadingVitals" class="flex flex-col items-center justify-center py-16 text-slate-400 space-y-4">
      <span class="text-4xl animate-spin">⏳</span>
      <p class="text-sm">Loading your smartwatch data…</p>
    </div>

    <!-- No vitals recorded yet -->
    <div *ngIf="!loadingVitals && !hasVitals && !result"
      class="bg-slate-800/60 border border-slate-700 rounded-2xl p-10 text-center space-y-4">
      <span class="text-5xl">⌚</span>
      <p class="text-black font-semibold">No smartwatch data found</p>
      <p class="text-slate-400 text-sm">
        Go to <strong>Health Monitor</strong>, run the Smartwatch Simulator for a few minutes,
        then come back here to get your disease risk prediction.
      </p>
    </div>

    <!-- ── Vitals summary + extra fields ──────────────────────────────── -->
    <div *ngIf="!loadingVitals && hasVitals && !result" class="space-y-5">

      <!-- Auto-loaded vitals card -->
      <div class="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
        <div class="flex items-center gap-3 border-b border-slate-700 pb-3">
          <span class="text-xl">⌚</span>
          <div>
            <p class="text-black font-bold text-sm">Smartwatch Averages</p>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-slate-900/60 rounded-xl p-3 text-center">
            <p class="text-2xl">🩸</p>
            <p class="text-black font-bold">{{avgBloodSugar | number:'1.0-0'}}</p>
            <p class="text-slate-500 text-xs">Blood Sugar mg/dL</p>
          </div>
          <div class="bg-slate-900/60 rounded-xl p-3 text-center">
            <p class="text-2xl">💓</p>
            <p class="text-black font-bold">{{avgBloodPressure | number:'1.0-0'}}</p>
            <p class="text-slate-500 text-xs">Systolic BP mmHg</p>
          </div>
          <div class="bg-slate-900/60 rounded-xl p-3 text-center">
            <p class="text-2xl">🫁</p>
            <p class="text-black font-bold">{{avgOxygen | number:'1.1-1'}}%</p>
            <p class="text-slate-500 text-xs">SpO₂</p>
          </div>
          <div class="bg-slate-900/60 rounded-xl p-3 text-center">
            <p class="text-2xl">❤️</p>
            <p class="text-black font-bold">{{avgHeartRate | number:'1.0-0'}}</p>
            <p class="text-slate-500 text-xs">Heart Rate bpm</p>
          </div>
        </div>
      </div>

      <!-- Extra health fields (not from smartwatch) -->
      <div class="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-5">

        <!-- Section header -->
        <div class="flex items-center gap-3 border-b border-slate-700 pb-3">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-sm shadow">📋</div>
          <p class="text-black font-bold text-sm">Additional Health Info</p>
        </div>

        <!-- Numeric inputs row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <!-- BMI -->
          <div class="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-4 space-y-2 hover:border-indigo-600/50 transition">
            <div class="flex items-center gap-2">
              <span class="text-xl">⚖️</span>
              <span class="text-slate-400 text-xs font-semibold uppercase tracking-wide">BMI</span>
            </div>
            <input type="number" [(ngModel)]="extra.bmi" min="10" max="60" step="0.1"
              class="w-full bg-transparent text-2xl font-bold text-black border-none outline-none focus:outline-none placeholder-slate-600"
              placeholder="22.5"/>
            <p class="text-slate-600 text-[11px]">kg/m² · Normal: 18.5–24.9</p>
          </div>

          <!-- Cholesterol -->
          <div class="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-4 space-y-2 hover:border-yellow-600/50 transition">
            <div class="flex items-center gap-2">
              <span class="text-xl">🩺</span>
              <span class="text-slate-400 text-xs font-semibold uppercase tracking-wide">Cholesterol</span>
            </div>
            <input type="number" [(ngModel)]="extra.cholesterol" min="80" max="400"
              class="w-full bg-transparent text-2xl font-bold text-black border-none outline-none focus:outline-none placeholder-slate-600"
              placeholder="180"/>
            <p class="text-slate-600 text-[11px]">mg/dL · Optimal: &lt;200</p>
          </div>

          <!-- Physical Activity -->
          <div class="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-4 space-y-2 hover:border-green-600/50 transition">
            <div class="flex items-center gap-2">
              <span class="text-xl">🏃</span>
              <span class="text-slate-400 text-xs font-semibold uppercase tracking-wide">Activity</span>
            </div>
            <input type="number" [(ngModel)]="extra.physical_activity" min="0" max="7"
              class="w-full bg-transparent text-2xl font-bold text-black border-none outline-none focus:outline-none placeholder-slate-600"
              placeholder="3"/>
            <p class="text-slate-600 text-[11px]">days/week · Recommended: ≥5</p>
          </div>

        </div>

        <!-- Toggle questions row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Smoking -->
          <div class="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">🚬</span>
              <span class="text-black font-semibold text-sm">Do you smoke?</span>
            </div>
            <div class="flex gap-3">
              <button (click)="extra.smoking = 0"
                [class]="'flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 ' +
                  (extra.smoking === 0
                    ? 'bg-green-500/20 border-green-400 text-green-300 shadow-lg shadow-green-900/30'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500')">
                ✅ Non-smoker
              </button>
              <button (click)="extra.smoking = 1"
                [class]="'flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 ' +
                  (extra.smoking === 1
                    ? 'bg-red-500/20 border-red-400 text-red-300 shadow-lg shadow-red-900/30'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500')">
                🚬 Smoker
              </button>
            </div>
          </div>

          <!-- Family History -->
          <div class="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">🧬</span>
              <span class="text-black font-semibold text-sm">Family history of chronic disease?</span>
            </div>
            <div class="flex gap-3">
              <button (click)="extra.family_history = 0"
                [class]="'flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 ' +
                  (extra.family_history === 0
                    ? 'bg-green-500/20 border-green-400 text-green-300 shadow-lg shadow-green-900/30'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500')">
                ✅ No history
              </button>
              <button (click)="extra.family_history = 1"
                [class]="'flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 ' +
                  (extra.family_history === 1
                    ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-lg shadow-orange-900/30'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500')">
                ⚠️ Has history
              </button>
            </div>
          </div>

        </div>
      </div>



      <!-- Predict button -->
      <button (click)="predict()" [disabled]="predicting"
        class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-black font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2">
        <span *ngIf="predicting" class="animate-spin">⏳</span>
        <span *ngIf="!predicting">🔮</span>
        {{predicting ? 'Analysing your vitals…' : 'Predict My Disease Risk'}}
      </button>
    </div>

    <!-- ── RESULTS ─────────────────────────────────────────────────────── -->
    <div *ngIf="result" class="space-y-5">

      <!-- Overall banner -->
      <div [class]="overallBannerClass()">
        <div class="flex items-start gap-4">
          <span class="text-4xl">{{overallIcon()}}</span>
          <div>
            <p class="text-lg font-extrabold">{{result.overallRisk}} RISK</p>
            <p class="text-sm mt-1 opacity-90">{{result.summary}}</p>
          </div>
        </div>
      </div>

      <!-- Vitals used -->
      <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl px-5 py-3">
        <p class="text-slate-400 text-xs font-semibold mb-2">⌚ Vitals used for prediction (smartwatch averages)</p>
        <div class="flex flex-wrap gap-4 text-xs text-slate-300">
          <span>🩸 Blood Sugar: <strong>{{avgBloodSugar | number:'1.0-0'}} mg/dL</strong></span>
          <span>💓 Systolic BP: <strong>{{avgBloodPressure | number:'1.0-0'}} mmHg</strong></span>
          <span>🫁 SpO₂: <strong>{{avgOxygen | number:'1.1-1'}}%</strong></span>
          <span>❤️ Heart Rate: <strong>{{avgHeartRate | number:'1.0-0'}} bpm</strong></span>

          <span>BMI: <strong>{{extra.bmi}}</strong></span>
        </div>
      </div>

      <!-- 4 disease cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div *ngFor="let p of result.predictions"
          [class]="'rounded-2xl border p-5 space-y-3 ' + cardClass(p.probability)">
          <div class="flex items-center justify-between">
            <span class="text-black font-bold text-sm">{{p.label}}</span>
            <span [class]="'text-xs font-bold px-2 py-0.5 rounded-full ' + riskBadgeClass(p.probability)">
              {{riskLabel(p.probability)}}
            </span>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-400">Risk Probability</span>
              <span class="font-bold" [class]="riskTextColor(p.probability)">{{pct(p.probability)}}</span>
            </div>
            <div class="w-full bg-slate-900 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-700"
                [style.width]="pct(p.probability)"
                [style.background]="riskBarColor(p.probability)">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-xs text-slate-500 text-center">
        ⚠️ This prediction is AI-generated for informational purposes only.
        Always consult a qualified healthcare professional for medical advice.
      </div>

      <button (click)="reset()"
        class="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-black text-sm font-semibold rounded-xl transition">
        ← Run Another Assessment
      </button>
    </div>

  </div>
</div>
`,
  styles: [`:host { display: block; }`]
})
export class DiseaseRiskComponent implements OnInit {

  // ── Smartwatch averages (auto-loaded) ────────────────────────────────────────
  avgBloodSugar = 0;
  avgBloodPressure = 0;
  avgOxygen = 0;
  avgHeartRate = 0;
  totalReadings = 0;
  hasVitals = false;
  loadingVitals = true;

  // ── Extra fields the user fills in ──────────────────────────────────────────
  extra = {
    age: 40,
    bmi: 25.0,
    cholesterol: 190,
    physical_activity: 3,
    smoking: 0,
    family_history: 0,
  };
  ageAutoFilled = false;  // true when age was loaded from the user's profile

  // ── Result state ─────────────────────────────────────────────────────────────
  result: PredictionResponse | null = null;
  predicting = false;
  error = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadSmartWatchAverages();
    this.loadUserAge();
  }

  // ── Load age from user profile (dateOfBirth) ─────────────────────────────────
  private loadUserAge() {
    const token = localStorage.getItem('TokenUserConnect') || localStorage.getItem('token');
    if (!token) return;

    this.http.get<any>('http://localhost:8088/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (profile) => {
        if (profile?.dateOfBirth) {
          const birth = new Date(profile.dateOfBirth);
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          if (age > 0 && age < 130) {
            this.extra.age = age;
            this.ageAutoFilled = true;
          }
        }
      },
      error: () => { /* silently ignore — user can fill in manually */ }
    });
  }

  // ── Load vitals from the chronic condition history in the DB ─────────────────
  private loadSmartWatchAverages() {
    const patientId = this.getPatientId();
    if (!patientId) {
      this.loadingVitals = false;
      this.error = 'Could not identify your patient account. Please log in again.';
      return;
    }

    this.http.get<any[]>(`http://localhost:8088/api/chronic/patient/${patientId}`)
      .subscribe({
        next: (records) => {
          this.computeAverages(records || []);
          this.loadingVitals = false;
        },
        error: () => {
          this.loadingVitals = false;
          this.error = 'Could not load smartwatch data from the server. Is the backend running?';
        }
      });
  }

  /** Compute per-type averages from the raw chronic condition records. */
  private computeAverages(records: any[]) {
    this.totalReadings = records.length;
    if (records.length === 0) { this.hasVitals = false; return; }

    const avg = (type: string) => {
      const vals = records
        .filter(r => r.conditionType === type && r.value != null)
        .map(r => parseFloat(r.value));
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };

    this.avgBloodSugar = avg('BLOOD_SUGAR');
    this.avgBloodPressure = avg('BLOOD_PRESSURE');
    this.avgOxygen = avg('OXYGEN_SATURATION');
    this.avgHeartRate = avg('HEART_RATE');

    // At least one vital must have readings
    this.hasVitals = (this.avgBloodSugar + this.avgBloodPressure +
      this.avgOxygen + this.avgHeartRate) > 0;
  }

  /** Get patient ID exactly as the rest of the app does it. */
  private getPatientId(): number | null {
    const id = Number(localStorage.getItem('userId') ?? 0);
    return id > 0 ? id : null;
  }

  // ── Predict ───────────────────────────────────────────────────────────────────
  predict() {
    this.predicting = true;
    this.error = '';

    const body = {
      age: this.extra.age,
      bmi: this.extra.bmi,
      systolic_bp: Math.round(this.avgBloodPressure) || 120,
      fasting_glucose: Math.round(this.avgBloodSugar) || 95,
      smoking: this.extra.smoking,
      physical_activity: this.extra.physical_activity,
      family_history: this.extra.family_history,
      cholesterol: this.extra.cholesterol,
    };

    this.http.post<PredictionResponse>(
      'http://localhost:8088/api/disease-risk/predict', body
    ).subscribe({
      next: r => { this.result = r; this.predicting = false; },
      error: e => {
        this.error = e?.error?.error || 'Prediction service unavailable.';
        this.predicting = false;
      }
    });
  }

  reset() { this.result = null; this.error = ''; }

  // ── UI helpers ────────────────────────────────────────────────────────────
  pct(v: number): string { return Math.round(v * 100) + '%'; }

  overallIcon(): string {
    return ({ HIGH: '🚨', MEDIUM: '⚠️', LOW: '✅' } as any)[this.result?.overallRisk ?? 'LOW'];
  }

  overallBannerClass(): string {
    const base = 'rounded-2xl border p-5 ';
    return base + ({
      HIGH:   'bg-red-950/60 border-red-500/60 text-red-200',
      MEDIUM: 'bg-yellow-950/50 border-yellow-500/50 text-yellow-200',
      LOW:    'bg-green-950/50 border-green-600/50 text-green-200',
    } as any)[this.result?.overallRisk ?? 'LOW'];
  }

  /**
   * Three-tier risk classification by probability:
   *   LOW      0–19%    green
   *   WARNING  20–59%   amber
   *   CRITICAL 60–100%  red
   */
  private _tier(prob: number): 'LOW' | 'WARNING' | 'CRITICAL' {
    if (prob >= 0.60) return 'CRITICAL';
    if (prob >= 0.20) return 'WARNING';
    return 'LOW';
  }

  riskLabel(prob: number): string {
    return ({ LOW: '✅ Low Risk', WARNING: '⚠️ Warning', CRITICAL: '🚨 Critical' })[this._tier(prob)];
  }

  riskBadgeClass(prob: number): string {
    return ({
      LOW:      'bg-green-900/50 border border-green-600/50 text-green-300',
      WARNING:  'bg-yellow-900/60 border border-yellow-500/60 text-yellow-300',
      CRITICAL: 'bg-red-900/60 border border-red-500/60 text-red-300',
    })[this._tier(prob)];
  }

  riskTextColor(prob: number): string {
    return ({ LOW: 'text-green-400', WARNING: 'text-yellow-400', CRITICAL: 'text-red-400' })[this._tier(prob)];
  }

  riskBarColor(prob: number): string {
    return ({ LOW: '#22c55e', WARNING: '#f59e0b', CRITICAL: '#ef4444' })[this._tier(prob)];
  }

  cardClass(prob: number): string {
    return ({
      LOW:      'bg-slate-800/60 border-slate-700',
      WARNING:  'bg-yellow-950/30 border-yellow-700/40',
      CRITICAL: 'bg-red-950/30 border-red-700/40',
    })[this._tier(prob)];
  }
}
