import { Component, OnInit } from '@angular/core';
import {
  PrescriptionResponse,
  PrescriptionService,
  PrescriptionStatus,
  STATUS_META,
} from '../../../../services/prescription-service.service';

const ANALYSIS_TYPE_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  ANALYSE_DIAGNOSTIQUE:    { label: 'Analyses médicales diagnostiques', icon: '🔬', color: '#3b82f6', bg: '#dbeafe' },
  ANALYSE_MICROBIOLOGIQUE: { label: 'Analyses microbiologiques',         icon: '🦠', color: '#8b5cf6', bg: '#ede9fe' },
  EXAMEN_ANATOMOPATHOLOGIQUE: { label: 'Examens anatomopathologiques',   icon: '🧬', color: '#10b981', bg: '#d1fae5' },
  TEST_GENETIQUE:          { label: 'Tests génétiques',                  icon: '🧪', color: '#f59e0b', bg: '#fef3c7' },
  ANALYSE:                 { label: 'Analyse',                           icon: '🔬', color: '#3b82f6', bg: '#dbeafe' },
};

@Component({
  selector: 'app-lab-prescriptions',
  template: `
<div class="min-h-screen bg-gray-50 p-6 lg:p-8">

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">Prescriptions d'Analyses</h1>
      <p class="text-sm text-gray-500 mt-0.5">
        {{prescriptions.length}} prescription(s) reçue(s) •
        <span class="text-cyan-600 font-medium">Portail Laboratoire</span>
      </p>
    </div>
    <button (click)="load()"
      class="px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold text-sm transition-colors shadow-sm flex items-center gap-2">
      🔄 Actualiser
    </button>
  </div>

  <!-- Filter tabs by analysis type -->
  <div class="flex gap-2 flex-wrap mb-6">
    <button (click)="activeTypeFilter = 'ALL'"
      [class]="'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ' +
               (activeTypeFilter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50')">
      Tous ({{prescriptions.length}})
    </button>
    <button *ngFor="let key of analysisTypeKeys"
      (click)="activeTypeFilter = (activeTypeFilter === key ? 'ALL' : key)"
      [style.background]="activeTypeFilter === key ? ANALYSIS_TYPE_META[key].color : 'white'"
      [style.color]="activeTypeFilter === key ? 'white' : '#4b5563'"
      [style.border-color]="activeTypeFilter === key ? ANALYSIS_TYPE_META[key].color : '#e5e7eb'"
      class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors hover:opacity-90">
      {{ANALYSIS_TYPE_META[key].icon}} {{ANALYSIS_TYPE_META[key].label}} ({{countByType(key)}})
    </button>
  </div>

  <!-- Status filter chips -->
  <div class="flex gap-2 flex-wrap mb-6">
    <button (click)="activeStatusFilter = 'ALL'"
      [class]="'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ' +
               (activeStatusFilter === 'ALL' ? 'bg-cyan-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50')">
      Tous les statuts
    </button>
    <button *ngFor="let s of statusKeys"
      (click)="activeStatusFilter = (activeStatusFilter === s ? 'ALL' : s)"
      [style.background]="activeStatusFilter === s ? STATUS_META[s].color : 'white'"
      [style.color]="activeStatusFilter === s ? 'white' : '#4b5563'"
      [style.border-color]="activeStatusFilter === s ? STATUS_META[s].color : '#e5e7eb'"
      class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors">
      {{STATUS_META[s].icon}} {{STATUS_META[s].label}} ({{countByStatus(s)}})
    </button>
  </div>

  <!-- Loading -->
  <div *ngIf="loading" class="space-y-4">
    <div *ngFor="let i of [1,2,3]" class="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div class="flex gap-4">
        <div class="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 w-2/5 rounded bg-gray-200"></div>
          <div class="h-3 w-3/5 rounded bg-gray-200"></div>
          <div class="h-3 w-1/4 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Error -->
  <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
    ⚠️ {{error}}
    <button (click)="load(); error=''" class="ml-2 underline">Réessayer</button>
  </div>

  <!-- Empty state -->
  <div *ngIf="!loading && !error && filtered.length === 0"
    class="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
    <p class="text-4xl mb-3">🔬</p>
    <p class="text-gray-500 font-medium">Aucune prescription d'analyse reçue</p>
    <p class="text-gray-400 text-sm mt-1">Les prescriptions d'analyse des patients apparaîtront ici.</p>
  </div>

  <!-- Prescription cards -->
  <div class="space-y-4" *ngIf="!loading">
    <div *ngFor="let rx of filtered; let i = index"
      class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

      <!-- Card header -->
      <div class="p-5 flex items-start gap-4 cursor-pointer" (click)="rx.expanded = !rx.expanded">

        <!-- Analysis type icon -->
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
          [style.background]="getAnalysisMeta(rx).bg">
          {{getAnalysisMeta(rx).icon}}
        </div>

        <div class="flex-1 min-w-0">
          <!-- Title row -->
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <h3 class="font-bold text-gray-900">Prescription #{{rx.prescriptionID}}</h3>
            <!-- Analysis type badge -->
            <span class="px-2.5 py-0.5 text-xs rounded-full font-semibold text-white"
              [style.background]="getAnalysisMeta(rx).color">
              {{getAnalysisMeta(rx).icon}} {{getAnalysisMeta(rx).label}}
            </span>
            <!-- Status badge -->
            <span class="px-2.5 py-0.5 text-xs rounded-full font-semibold"
              [style.background]="STATUS_META[rx.status]?.bg"
              [style.color]="STATUS_META[rx.status]?.color"
              [style.border]="'1px solid ' + (STATUS_META[rx.status]?.border ?? '#e5e7eb')">
              {{STATUS_META[rx.status]?.icon}} {{STATUS_META[rx.status]?.label}}
            </span>
          </div>

          <!-- Note -->
          <p class="text-sm text-gray-600 truncate mb-1.5">{{rx.note || '—'}}</p>

          <!-- Meta row -->
          <div class="flex flex-wrap gap-3 text-xs text-gray-400">
            <span>📅 {{rx.date | date: 'dd MMM yyyy'}}</span>
            <span *ngIf="rx.patientName" class="text-emerald-600 font-medium">👤 {{rx.patientName}}</span>
            <span *ngIf="!rx.patientName" class="text-orange-400">⚠️ Patient inconnu</span>
            <span *ngIf="rx.doctorName" class="text-blue-600 font-medium">🩺 Dr. {{rx.doctorName}}</span>
          </div>
        </div>

        <!-- Chevron -->
        <div class="text-gray-400 transition-transform duration-200 mt-1 flex-shrink-0"
          [class.rotate-180]="rx.expanded">▾</div>
      </div>

      <!-- Expanded detail panel -->
      <div *ngIf="rx.expanded" class="border-t border-gray-100 bg-gray-50">

        <!-- Prescription full detail block (inspired by reference image) -->
        <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Doctor info -->
          <div class="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-xl p-4">
            <p class="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-2">Prescripteur</p>
            <p class="font-bold text-gray-900">{{rx.doctorName || 'Médecin inconnu'}}</p>
            <p class="text-xs text-gray-500 mt-0.5">Date : {{rx.date | date: 'dd/MM/yyyy'}}</p>
          </div>

          <!-- Patient info -->
          <div class="bg-gray-100 border border-gray-200 rounded-xl p-4">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Patient</p>
            <p class="font-bold text-gray-900">{{rx.patientName || 'Patient inconnu'}}</p>
            <p class="text-xs text-gray-500 mt-0.5">ID: {{rx.patientId || '—'}}</p>
          </div>

          <!-- Note du médecin -->
          <div class="md:col-span-2 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">📋 Note du médecin</p>
            <p class="text-sm text-gray-800 leading-relaxed">{{rx.note || 'Aucune note.'}}</p>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-2">
          <button *ngIf="rx.status === 'PENDING'"
            (click)="updateStatus(rx, 'VALIDATED', $event)"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5">
            ✅ Valider &amp; Préparer
          </button>
          <button *ngIf="rx.status === 'VALIDATED'"
            (click)="updateStatus(rx, 'COMPLETED', $event)"
            class="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-1.5">
            🎉 Marquer comme Terminé
          </button>
          <button *ngIf="rx.status !== 'CANCELLED' && rx.status !== 'COMPLETED'"
            (click)="updateStatus(rx, 'CANCELLED', $event)"
            class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5">
            ❌ Refuser
          </button>
          <span *ngIf="rx.status === 'COMPLETED'"
            class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
            🎉 Analyse terminée
          </span>
          <span *ngIf="rx.status === 'CANCELLED'"
            class="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1.5">
            ❌ Refusée
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LabPrescriptionsComponent implements OnInit {
  prescriptions: (PrescriptionResponse & { expanded?: boolean; acteType?: string })[] = [];
  loading = false;
  error = '';

  activeTypeFilter = 'ALL';
  activeStatusFilter: PrescriptionStatus | 'ALL' = 'ALL';

  STATUS_META = STATUS_META;
  ANALYSIS_TYPE_META = ANALYSIS_TYPE_META;

  readonly statusKeys: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'COMPLETED', 'CANCELLED'];
  readonly analysisTypeKeys = Object.keys(ANALYSIS_TYPE_META).filter(k => k !== 'ANALYSE');

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.prescriptionService.getAnalysisPrescriptions().subscribe({
      next: (data) => {
        this.prescriptions = data.map(rx => ({ ...rx, expanded: false }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des prescriptions d\'analyse.';
        this.loading = false;
      }
    });
  }

  get filtered() {
    return this.prescriptions.filter(rx => {
      const typeMatch = this.activeTypeFilter === 'ALL' || this.getActeType(rx) === this.activeTypeFilter;
      const statusMatch = this.activeStatusFilter === 'ALL' || rx.status === this.activeStatusFilter;
      return typeMatch && statusMatch;
    });
  }

  countByType(key: string): number {
    return this.prescriptions.filter(rx => this.getActeType(rx) === key).length;
  }

  countByStatus(s: PrescriptionStatus): number {
    return this.prescriptions.filter(rx => rx.status === s).length;
  }

  getAnalysisMeta(rx: any) {
    const type = this.getActeType(rx);
    return ANALYSIS_TYPE_META[type] ?? ANALYSIS_TYPE_META['ANALYSE'];
  }

  private getActeType(rx: any): string {
    return rx.acteType || 'ANALYSE';
  }

  updateStatus(rx: PrescriptionResponse & { expanded?: boolean }, status: PrescriptionStatus, event: Event): void {
    event.stopPropagation();
    this.prescriptionService.updateStatus(rx.prescriptionID, status).subscribe({
      next: (updated) => {
        const idx = this.prescriptions.findIndex(p => p.prescriptionID === rx.prescriptionID);
        if (idx !== -1) {
          this.prescriptions[idx] = { ...updated, expanded: true };
        }
      },
      error: () => { this.error = 'Erreur lors de la mise à jour du statut.'; }
    });
  }
}
