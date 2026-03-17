import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActeDTO,
  PatientDTO,
  PrescriptionRequest,
  PrescriptionResponse,
  PrescriptionService,
  PrescriptionStatus,
  STATUS_META,
} from '../../../../services/prescription-service.service';
import { interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-doctor-prescriptions',
  template: `
  <div class="min-h-screen bg-gray-50 p-6 lg:p-8">

  <!-- ── Header ────────────────────────────────────────────────────────────── -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">Mes Prescriptions</h1>
      <p class="text-sm text-gray-500 mt-0.5">
        {{prescriptions.length}} prescription(s) au total •
        <span class="text-blue-600 font-medium">actualisation auto toutes les 30 s</span>
      </p>
    </div>
    <div class="flex items-center gap-3">
      <button (click)="sortDesc = !sortDesc"
        class="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
        <span>{{ sortDesc ? '↓' : '↑' }}</span> Date
      </button>
      <button (click)="openAddModal()"
        class="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
        <span>+</span> Nouvelle prescription
      </button>
    </div>
  </div>

  <!-- ── Summary cards ─────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    <div *ngFor="let s of statusKeys.slice(0,4)"
      (click)="activeFilter = (activeFilter === s ? 'ALL' : s)"
      class="bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md"
      [style.border-color]="activeFilter === s ? STATUS_META[s].color : '#e5e7eb'"
      [style.background]="activeFilter === s ? STATUS_META[s].bg : 'white'">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xl">{{STATUS_META[s].icon}}</span>
        <span class="text-2xl font-extrabold" [style.color]="STATUS_META[s].color">
          {{countByStatus(s)}}
        </span>
      </div>
      <p class="text-xs font-semibold text-gray-600">{{STATUS_META[s].label}}</p>
    </div>
  </div>

  <!-- ── Filter chips ───────────────────────────────────────────────────────── -->
  <div class="flex gap-2 flex-wrap mb-6">
    <button (click)="activeFilter = 'ALL'"
      [class]="'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ' +
               (activeFilter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50')">
      Toutes ({{prescriptions.length}})
    </button>
    <button *ngFor="let s of statusKeys"
      (click)="activeFilter = (activeFilter === s ? 'ALL' : s)"
      [style.background]="activeFilter === s ? STATUS_META[s].color : 'white'"
      [style.color]="activeFilter === s ? 'white' : '#4b5563'"
      [style.border-color]="activeFilter === s ? STATUS_META[s].color : '#e5e7eb'"
      class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors hover:opacity-90">
      {{STATUS_META[s].icon}} {{STATUS_META[s].label}} ({{countByStatus(s)}})
    </button>
  </div>

  <!-- ── Loading skeletons ──────────────────────────────────────────────────── -->
  <div *ngIf="loading" class="space-y-4">
    <div *ngFor="let i of [1,2,3]" class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex gap-4">
        <div class="skeleton w-12 h-12 rounded-lg flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-4 w-2/5 rounded"></div>
          <div class="skeleton h-3 w-3/5 rounded"></div>
          <div class="skeleton h-3 w-1/4 rounded"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Error ──────────────────────────────────────────────────────────────── -->
  <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
    ⚠️ {{error}}
    <button (click)="loadAll(); error=''" class="ml-2 underline">Réessayer</button>
  </div>

  <!-- ── Empty state ────────────────────────────────────────────────────────── -->
  <div *ngIf="!loading && !error && filtered.length === 0"
    class="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
    <p class="text-4xl mb-3">💊</p>
    <p class="text-gray-500 font-medium">Aucune prescription trouvée</p>
    <p class="text-gray-400 text-sm mt-1">
      {{ activeFilter === 'ALL' ? 'Commencez par ajouter une prescription.' : 'Changez le filtre actif.' }}
    </p>
  </div>

  <!-- ── Prescription cards ─────────────────────────────────────────────────── -->
  <div class="space-y-3" *ngIf="!loading">
    <div *ngFor="let rx of filtered; trackBy: trackById; let i = index"
      class="rx-card bg-white rounded-xl border border-gray-200 overflow-hidden"
      [style.animation-delay]="(i * 60) + 'ms'">

      <!-- Card header (clickable) -->
      <div class="p-5 flex items-start gap-4 cursor-pointer" (click)="rx.expanded = !rx.expanded">

        <!-- Icon -->
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
          [style.background]="STATUS_META[rx.status]?.bg ?? '#f3f4f6'">
          {{STATUS_META[rx.status]?.icon ?? '💊'}}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <h3 class="font-bold text-gray-900">Prescription #{{rx.prescriptionID}}</h3>
            <span class="px-2.5 py-0.5 text-xs rounded-full font-semibold"
              [class.status-pending]="rx.status === 'PENDING'"
              [style.background]="STATUS_META[rx.status]?.bg"
              [style.color]="STATUS_META[rx.status]?.color"
              [style.border]="'1px solid ' + (STATUS_META[rx.status]?.border ?? '#e5e7eb')">
              {{STATUS_META[rx.status]?.icon}} {{STATUS_META[rx.status]?.label}}
            </span>
          </div>

          <p class="text-sm text-gray-600 truncate mb-1.5">{{rx.note || '—'}}</p>

          <div class="flex flex-wrap gap-3 text-xs text-gray-400">
            <span>📅 {{rx.date | date: 'dd MMM yyyy'}}</span>
            <span *ngIf="rx.statusUpdatedAt">
              🔄 màj {{rx.statusUpdatedAt | date: 'dd MMM, HH:mm'}}
            </span>
            <span *ngIf="rx.medicines?.length">
              💊 {{rx.medicines.length}} médicament(s)
            </span>
            <span *ngIf="rx.patientName" class="text-green-600 font-medium">
              👤 {{rx.patientName}}
            </span>
            <span *ngIf="!rx.patientName" class="text-orange-400">
              ⚠️ Non affecté
            </span>
          </div>

          <!-- Medicine tags -->
          <div class="mt-2 flex flex-wrap gap-1" *ngIf="rx.medicines?.length">
            <span *ngFor="let m of rx.medicines.slice(0, 4)"
              class="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100">
              {{m.medicineName}} ×{{m.quantity}}
            </span>
            <span *ngIf="rx.medicines.length > 4" class="text-xs text-gray-400 py-0.5">
              +{{rx.medicines.length - 4}} autres
            </span>
          </div>
        </div>

        <!-- Chevron -->
        <div class="text-gray-400 transition-transform duration-200 mt-1 flex-shrink-0"
          [class.rotate-180]="rx.expanded">
          ▾
        </div>
      </div>

      <!-- Mini progress bar -->
      <div *ngIf="rx.status !== 'CANCELLED'" class="px-5 pb-3">
        <div class="progress-track h-8">
          <div class="progress-fill"
            [style.width]="(stepOf(rx.status) >= 0 ? ((stepOf(rx.status)) / (STEPS.length - 1)) * 100 : 0) + '%'">
          </div>
          <div *ngFor="let step of STEPS; let si = index" class="step-dot"
            [style.background]="si <= stepOf(rx.status) ? STATUS_META[step].color : '#e5e7eb'"
            [style.color]="si <= stepOf(rx.status) ? 'white' : '#9ca3af'"
            [title]="STATUS_META[step].label">
            {{si <= stepOf(rx.status) ? '✓' : (si + 1)}}
          </div>
        </div>
        <div class="flex justify-between mt-0.5">
          <span *ngFor="let step of STEPS" class="text-[10px] text-gray-400 text-center" style="flex:1">
            {{STATUS_META[step].label}}
          </span>
        </div>
      </div>

      <!-- Cancelled banner -->
      <div *ngIf="rx.status === 'CANCELLED'"
        class="mx-5 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2">
        ❌ Cette prescription a été annulée
      </div>

      <!-- Expanded actions -->
      <div *ngIf="rx.expanded"
        class="border-t border-gray-100 bg-gray-50 px-5 py-3 flex flex-wrap gap-2">
        <button (click)="openDetail(rx, $event)"
          class="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5">
          🔍 Voir les détails
        </button>
        <button (click)="openEditModal(rx, $event)"
          class="px-3.5 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5">
          ✏️ Modifier
        </button>
        <button (click)="openAssignModal(rx, $event)"
          class="px-3.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors flex items-center gap-1.5">
          👤 Affecter à un acte
        </button>
        <button (click)="deletePrescription(rx.prescriptionID, $event)"
          class="px-3.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5">
          🗑️ Supprimer
        </button>
      </div>
    </div>
  </div>


  <!-- ════════════════════════════════════════════════════════════════════════
       DETAIL MODAL
  ════════════════════════════════════════════════════════════════════════ -->
  <div *ngIf="showDetail && detailRx"
    class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    (click)="closeDetail()">

    <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      (click)="$event.stopPropagation()">

      <!-- Modal header -->
      <div class="p-6 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-gray-900">
            Prescription #{{detailRx.prescriptionID}}
          </h2>
          <p class="text-sm text-gray-500 mt-0.5">{{detailRx.date | date: 'EEEE d MMMM yyyy'}}</p>
          <span *ngIf="detailRx.patientName" class="text-green-600 font-medium text-sm">
            👤 {{detailRx.patientName}}
          </span>
          <span *ngIf="!detailRx.patientName" class="text-orange-400 text-sm">
            ⚠️ Non affecté
          </span>
        </div>
        <span class="px-3 py-1 rounded-full text-sm font-bold"
          [class.status-pending]="detailRx.status === 'PENDING'"
          [style.background]="STATUS_META[detailRx.status]?.bg"
          [style.color]="STATUS_META[detailRx.status]?.color">
          {{STATUS_META[detailRx.status]?.icon}} {{STATUS_META[detailRx.status]?.label}}
        </span>
      </div>

      <div class="p-6 space-y-6 overflow-y-auto flex-1">

        <!-- ── Status timeline ── -->
        <div>
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            Suivi en temps réel
          </p>

          <div *ngIf="detailRx.status !== 'CANCELLED'">
            <div class="progress-track h-8 mb-2">
              <div class="progress-fill"
                [style.width]="(stepOf(detailRx.status) >= 0 ? (stepOf(detailRx.status) / (STEPS.length - 1)) * 100 : 0) + '%'">
              </div>
              <div *ngFor="let step of STEPS; let si = index"
                class="step-dot"
                [style.background]="si <= stepOf(detailRx.status) ? STATUS_META[step].color : '#e5e7eb'"
                [style.color]="si <= stepOf(detailRx.status) ? 'white' : '#9ca3af'"
                [title]="STATUS_META[step].label">
                {{si <= stepOf(detailRx.status) ? '✓' : (si + 1)}}
              </div>
            </div>
            <div class="flex justify-between">
              <div *ngFor="let step of STEPS; let si = index" class="flex-1 text-center">
                <p class="text-xs font-semibold"
                  [style.color]="si <= stepOf(detailRx.status) ? STATUS_META[step].color : '#9ca3af'">
                  {{STATUS_META[step].label}}
                </p>
              </div>
            </div>
          </div>

          <div *ngIf="detailRx.status === 'CANCELLED'"
            class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
            ❌ Cette prescription a été annulée.
          </div>

          <p *ngIf="detailRx.statusUpdatedAt" class="text-xs text-gray-400 mt-3 text-right">
            Dernière mise à jour : {{detailRx.statusUpdatedAt | date: 'dd/MM/yyyy à HH:mm'}}
          </p>
        </div>

        <!-- ── Note ── -->
        <div class="bg-gray-50 rounded-xl p-4">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Note du médecin</p>
          <p class="text-gray-800 text-sm leading-relaxed">{{detailRx.note || 'Aucune note.'}}</p>
        </div>

        <!-- ── Medicines list ── -->
        <div *ngIf="detailRx.medicines && detailRx.medicines.length > 0">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Médicaments prescrits ({{detailRx.medicines.length}})
          </p>
          <div class="space-y-2">
            <div *ngFor="let m of detailRx.medicines; let mi = index"
              class="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-200 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">💊</div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">{{m.medicineName}}</p>
                  <p class="text-xs text-gray-400">ID: {{m.medicineId}}</p>
                </div>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                ×{{m.quantity}}
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="!detailRx.medicines || detailRx.medicines.length === 0"
          class="text-center py-4 text-gray-400 text-sm">
          Aucun médicament associé.
        </div>

      </div>

      <!-- Modal footer -->
      <div class="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
        <button (click)="openEditModal(detailRx); closeDetail()"
          class="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          ✏️ Modifier
        </button>
        <button (click)="closeDetail()"
          class="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Fermer
        </button>
      </div>
    </div>
  </div>


 <!-- ════════════════════════════════════════════════════════════════════════
     ASSIGN ACTE MODAL  (respecte Prescription → Acte → MedicalFile → User)
════════════════════════════════════════════════════════════════════════ -->
<div *ngIf="showAssignModal && assigningRx"
  class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  (click)="showAssignModal = false">

  <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
    (click)="$event.stopPropagation()">

    <!-- Header -->
    <div class="p-6 border-b border-gray-100 flex justify-between items-center">
      <div>
        <h2 class="text-lg font-extrabold text-gray-900">👤 Affecter à un patient</h2>
        <p class="text-xs text-gray-400 mt-0.5">via sélection d'un Acte médical</p>
      </div>
      <button (click)="showAssignModal = false" class="text-gray-400 hover:text-gray-700 text-xl">✕</button>
    </div>

    <div class="p-6 space-y-4 overflow-y-auto flex-1">

      <!-- Prescription info -->
      <div class="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <p class="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Prescription</p>
        <p class="text-sm font-semibold text-blue-800">#{{assigningRx.prescriptionID}} — {{assigningRx.note || 'Sans note'}}</p>
      </div>

      <!-- Current patient -->
      <div *ngIf="assigningRx.patientName"
        class="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-700 font-medium flex items-center gap-2">
        ✅ Patient actuel : <strong>{{assigningRx.patientName}}</strong>
      </div>
      <div *ngIf="!assigningRx.patientName"
        class="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm text-orange-600 font-medium">
        ⚠️ Aucun patient assigné
      </div>

      <!-- Search -->
      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Rechercher un acte / patient
        </label>
        <input type="text" [(ngModel)]="acteSearch" placeholder="🔍 Nom du patient, type d'acte..."
          class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
      </div>

      <!-- Acte list -->
      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Sélectionner un acte ({{filteredActes.length}} disponible(s))
        </label>

        <!-- No results -->
        <div *ngIf="filteredActes.length === 0"
          class="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
          Aucun acte trouvé
        </div>

        <!-- Acte cards (selectable) -->
        <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
          <div *ngFor="let a of filteredActes"
            (click)="selectedActeId = a.acteId"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all"
            [class.border-green-500]="selectedActeId === a.acteId"
            [class.bg-green-50]="selectedActeId === a.acteId"
            [class.border-gray-200]="selectedActeId !== a.acteId"
            [class.hover:border-gray-300]="selectedActeId !== a.acteId">

            <!-- Selected indicator -->
            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
              [class.border-green-500]="selectedActeId === a.acteId"
              [class.bg-green-500]="selectedActeId === a.acteId"
              [class.border-gray-300]="selectedActeId !== a.acteId">
              <span *ngIf="selectedActeId === a.acteId" class="text-white text-xs">✓</span>
            </div>

            <!-- Acte info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-gray-900">Acte #{{a.acteId}}</span>
                <span *ngIf="a.typeOfActe"
                  class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {{a.typeOfActe}}
                </span>
              </div>
              <p *ngIf="a.description" class="text-xs text-gray-500 truncate mt-0.5">{{a.description}}</p>
            </div>

            <!-- Patient badge -->
            <div class="text-right flex-shrink-0">
              <div *ngIf="a.patientName"
                class="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                👤 {{a.patientName}}
              </div>
              <div *ngIf="!a.patientName"
                class="px-2.5 py-1 bg-gray-100 text-gray-400 text-xs rounded-full">
                Patient inconnu
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected summary -->
      <div *ngIf="selectedActeId !== null" class="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <p class="text-xs font-bold text-green-600 uppercase mb-1">Sélection</p>
        <ng-container *ngFor="let a of actes">
          <div *ngIf="a.acteId === selectedActeId" class="text-sm text-green-800 font-medium">
            Acte #{{a.acteId}} →
            <strong>{{a.patientName || 'Patient inconnu'}}</strong>
            <span *ngIf="a.typeOfActe" class="text-green-600"> ({{a.typeOfActe}})</span>
          </div>
        </ng-container>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
      <button (click)="showAssignModal = false"
        class="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors">
        Annuler
      </button>
      <button (click)="saveAssign()" [disabled]="selectedActeId === null"
        class="px-5 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2">
        ✅ Confirmer l'affectation
      </button>
    </div>
  </div>
</div>

  <!-- ════════════════════════════════════════════════════════════════════════
       UNIFIED ADD / EDIT MODAL
  ════════════════════════════════════════════════════════════════════════ -->
  <div *ngIf="showModal"
    class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    (click)="showModal = false">

    <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      (click)="$event.stopPropagation()">

      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
        <h2 class="text-lg font-extrabold text-gray-900">
          {{editMode ? '✏️ Modifier la prescription' : '➕ Nouvelle prescription & Acte'}}
        </h2>
        <button (click)="showModal = false" class="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
      </div>

      <div class="p-6 space-y-5 overflow-y-auto flex-1">
        
        <ng-container *ngIf="!editMode">
          <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2">
            <p class="text-xs text-blue-800 font-semibold mb-3">
              Un acte médical sera créé et lié automatiquement à cette prescription.
            </p>
            
            <div class="space-y-4">
              <!-- Patient -->
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Patient *</label>
                <select [(ngModel)]="form.patientId"
                  class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white">
                  <option [ngValue]="null" disabled>Sélectionner un patient...</option>
                  <option *ngFor="let p of patients" [ngValue]="p.patientId">{{p.patientName}}</option>
                </select>
              </div>

              <!-- Acte Type -->
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type d'acte *</label>
                <select [(ngModel)]="form.typeOfActe"
                  class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white">
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="ANALYSIS">Analyse</option>
                  <option value="DIAGNOSIS">Diagnostic</option>
                </select>
              </div>

              <!-- Acte Description -->
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description de l'acte *</label>
                <input type="text" [(ngModel)]="form.acteDescription" placeholder="Ex: Consultation médicale générale..."
                  class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Prescription Note -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Note de prescription</label>
          <textarea [(ngModel)]="form.note" rows="3"
            placeholder="Détails de l'ordonnance, instructions..."
            class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
          </textarea>
        </div>
      </div>

      <div class="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 z-10">
        <button (click)="showModal = false"
          class="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors">
          Annuler
        </button>
        <button (click)="save()" [disabled]="saving"
          class="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {{saving ? 'Sauvegarde...' : (editMode ? 'Enregistrer' : 'Créer Acte & Prescription')}}
        </button>
      </div>
    </div>
  </div>

</div>
`
})
export class DoctorPrescriptionsComponent implements OnInit, OnDestroy {
  acteSearch = '';
  actes: ActeDTO[] = [];
  patients: PatientDTO[] = [];
  showAssignModal = false;
  assigningRx: PrescriptionResponse | null = null;
  selectedActeId: number | null = null;

  prescriptions: PrescriptionResponse[] = [];
  loading = false;
  error = '';

  showDetail = false;
  detailRx: PrescriptionResponse | null = null;

  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  saving = false;

  form: any = { patientId: null, acteDescription: '', typeOfActe: 'PRESCRIPTION', note: '', date: '' };

  activeFilter: PrescriptionStatus | 'ALL' = 'ALL';
  sortDesc = true;

  private pollSub?: Subscription;

  STATUS_META = STATUS_META;
  statusKeys: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'DISPENSED', 'COMPLETED', 'CANCELLED'];
  readonly STEPS: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'DISPENSED', 'COMPLETED'];

  constructor(private prescriptionService: PrescriptionService) {}
  
  ngOnInit(): void {
    this.loadAll();
    this.loadActes();
    this.loadPatients();
    this.pollSub = interval(30_000)
      .pipe(switchMap(() => this.prescriptionService.getAll()))
      .subscribe({
        next: (data) => {
          this.prescriptions = data.map(rx => ({
            ...rx,
            expanded: this.prescriptions.find(p => p.prescriptionID === rx.prescriptionID)?.expanded ?? false
          }));
          if (this.detailRx) {
            const updated = this.prescriptions.find(p => p.prescriptionID === this.detailRx!.prescriptionID);
            if (updated) this.detailRx = updated;
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';
    this.prescriptionService.getAll().subscribe({
      next: (data) => {
        this.prescriptions = data.map(rx => ({ ...rx, expanded: false }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des prescriptions.';
        this.loading = false;
      }
    });
  }

  loadActes(): void {
  this.prescriptionService.getAllActes().subscribe({
    next: (data) => {
      console.log('ACTES REÇUS:', data);
      this.actes = data;
    },
    error: (err) => console.error('Erreur chargement actes', err)
  });
}

  loadPatients(): void {
    this.prescriptionService.getAllPatients().subscribe({
      next: (data) => this.patients = data,
      error: (err) => console.error('Erreur chargement patients', err)
    });
  }


  get filtered(): PrescriptionResponse[] {
    let list = this.activeFilter === 'ALL'
      ? [...this.prescriptions]
      : this.prescriptions.filter(rx => rx.status === this.activeFilter);
    list.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return this.sortDesc ? -diff : diff;
    });
    return list;
  }

  countByStatus(s: PrescriptionStatus): number {
    return this.prescriptions.filter(rx => rx.status === s).length;
  }

  statusMeta(status: PrescriptionStatus) {
    return STATUS_META[status] ?? STATUS_META['PENDING'];
  }

  stepOf(status: PrescriptionStatus): number {
    return this.STEPS.indexOf(status);
  }

  openDetail(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    this.detailRx = { ...rx };
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.detailRx = null;
  }

  openAddModal(): void {
    this.editMode = false;
    this.selectedId = null;
    const isoString = new Date().toISOString();
    this.form = { patientId: null, acteDescription: '', typeOfActe: 'PRESCRIPTION', note: '', date: isoString };
    console.log('📅 Date envoyée:', isoString);
    this.showModal = true;
  }

  openEditModal(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    this.editMode = true;
    this.selectedId = rx.prescriptionID;
    this.form = {
      patientId: null, acteDescription: '', typeOfActe: '',
      note: rx.note,
      date: new Date(rx.date).toISOString()
    };
    this.showModal = true;
  }

  openAssignModal(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    this.assigningRx = rx;
    this.selectedActeId = rx.acteId ?? null;
    this.showAssignModal = true;
  }

  save(): void {
    if (this.saving) return;

    if (!this.editMode && !this.form.patientId) {
      this.error = "Veuillez sélectionner un patient.";
      return;
    }
    if (!this.editMode && !this.form.acteDescription) {
      this.error = "Veuillez fournir une description pour l'acte.";
      return;
    }

    let dateToSend = this.form.date;
    if (dateToSend && dateToSend.length === 16) {
      dateToSend = dateToSend + ':00.000Z';
    }
    const rxDataToSend = { note: this.form.note, date: dateToSend };

    this.saving = true;

    if (this.editMode && this.selectedId !== null) {
      this.prescriptionService.update(this.selectedId, rxDataToSend).subscribe({
        next: () => {
          this.showModal = false;
          this.saving = false;
          this.loadAll();
        },
        error: () => {
          this.error = 'Erreur modification';
          this.saving = false;
        }
      });
    } else {
      // Create unified Acte + Prescription
      const acteReq = {
        date: dateToSend,
        description: this.form.acteDescription,
        typeOfActe: this.form.typeOfActe
      };
      
      this.prescriptionService.addActeForPatient(this.form.patientId, acteReq).pipe(
        switchMap(createdActe => {
          return this.prescriptionService.add(rxDataToSend).pipe(
            switchMap(createdRx => this.prescriptionService.assignActe(createdRx.prescriptionID, createdActe.acteId))
          );
        }),
        catchError(err => {
          console.error("Erreur lors de la création unifiée:", err);
          throw err;
        })
      ).subscribe({
        next: () => {
          this.showModal = false;
          this.saving = false;
          this.loadAll();
          this.loadActes(); // refresh actes in assign list
        },
        error: () => {
          this.error = "Erreur lors de la création de l'acte et de la prescription.";
          this.saving = false;
        }
      });
    }
  }

  saveAssign(): void {
    if (!this.assigningRx || this.selectedActeId === null) return;
    this.prescriptionService.assignActe(this.assigningRx.prescriptionID, this.selectedActeId)
      .subscribe({
        next: () => { this.showAssignModal = false; this.loadAll(); },
        error: () => { this.error = "Erreur lors de l'affectation."; }
      });
  }
  get filteredActes(): ActeDTO[] {
  if (!this.acteSearch.trim()) return this.actes;
  const q = this.acteSearch.toLowerCase();
  return this.actes.filter(a =>
    a.patientName?.toLowerCase().includes(q) ||
    a.typeOfActe?.toLowerCase().includes(q) ||
    a.description?.toLowerCase().includes(q) ||
    String(a.acteId).includes(q)
  );
}
  deletePrescription(id: number, event?: Event): void {
    event?.stopPropagation();
    if (!confirm('Voulez-vous vraiment supprimer cette prescription ?')) return;
    this.prescriptionService.delete(id).subscribe({
      next: () => {
        this.prescriptions = this.prescriptions.filter(rx => rx.prescriptionID !== id);
        if (this.detailRx?.prescriptionID === id) this.closeDetail();
      },
      error: () => { this.error = 'Erreur lors de la suppression.'; }
    });
  }

  trackById(_: number, rx: PrescriptionResponse): number {
    return rx.prescriptionID;
  }
}