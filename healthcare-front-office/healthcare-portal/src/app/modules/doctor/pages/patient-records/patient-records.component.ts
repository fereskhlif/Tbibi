import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { debounceTime, Subject } from 'rxjs';

export interface PrescriptionMinimalDTO {
  prescriptionId: number;
  note: string;
  date: string;
  status: string;
}

export interface PatientRecordDTO {
  medicalFileId: number;
  patientName: string;
  patientEmail: string;
  medicalHistory: string;
  chronicDisease: string;
  repDoc: string;
  existingPrescriptions?: PrescriptionMinimalDTO[];
}

export interface VaccineRequest {
  nom: string;
  type: string;
  observation: string;
}

export interface UrinaryExamRequest {
  libelle: string;
  date: string;
  malAnt: string;
  categorie: string;
  nTabMp: string;
  dDec: string;
  aCausal: string;
}

export interface HistoryRequest {
  filiere: string;
  visitNote: string;
  analyseSanguine: string;
  vaccination: string; // Keep for backward compatibility or simple text
  prescriptions: string[];
  autre: string;
  vaccines: VaccineRequest[];
  appareilUrinaire: string;
  urinaryExams: UrinaryExamRequest[];
}

@Component({
  selector: 'app-patient-records',
  standalone: false,
  template: `
<div class="pw">

  <!-- Header -->
  <div class="ph">
    <div class="ph-left">
      <div class="ph-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/>
        </svg>
      </div>
      <div>
        <h1>Dossiers Patients</h1>
        <p>Recherchez un patient pour enregistrer une visite médicale</p>
      </div>
    </div>
    <div class="stat-badge">
      <span class="sn">{{ patients.length }}</span>
      <span class="sl">patient(s)</span>
    </div>
  </div>

  <!-- Search -->
  <div class="s-wrap">
    <div class="s-box">
      <svg class="s-ico" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/></svg>
      <input id="patient-search" type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)"
        placeholder="Rechercher par nom..." class="s-inp" autocomplete="off"/>
      <span *ngIf="loading" class="spinner-sm"></span>
    </div>
    <div *ngIf="error" class="err-bar">⚠ {{ error }}</div>
  </div>

  <!-- Table -->
  <div class="tbl-card">
    <table class="ptbl">
      <thead><tr>
        <th>N° Dossier</th><th>Patient</th><th>Email</th><th>Maladie chronique</th><th>Action</th>
      </tr></thead>
      <tbody>
        <tr *ngIf="patients.length === 0 && !loading"><td colspan="5" class="empty">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
          Aucun patient trouvé
        </td></tr>
        <tr *ngFor="let p of patients" class="prow" (click)="openForm(p)">
          <td><span class="dos-badge">#{{ p.medicalFileId }}</span></td>
          <td>
            <div class="p-cell">
              <div class="av">{{ initials(p.patientName) }}</div>
              <span class="pname">{{ p.patientName }}</span>
            </div>
          </td>
          <td class="em">{{ p.patientEmail }}</td>
          <td>
            <span *ngIf="p.chronicDisease" class="ch-tag">{{ p.chronicDisease }}</span>
            <span *ngIf="!p.chronicDisease" class="nd">—</span>
          </td>
          <td>
            <button class="btn-visite" (click)="openForm(p); $event.stopPropagation()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              Nouvelle visite
            </button>
          </td>
        </tr>
        <!-- skeleton -->
        <tr *ngFor="let s of sk" [style.display]="loading && patients.length===0 ? '' : 'none'" class="skrow">
          <td><div class="skel sw60"></div></td><td><div class="skel sw130"></div></td>
          <td><div class="skel sw200"></div></td><td><div class="skel sw80"></div></td>
          <td><div class="skel sw100 sh28"></div></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ─── MODAL MAIN ────────────────────────────────────────────────────────── -->
  <div class="overlay" *ngIf="showModal" (click)="close()">
    <div class="modal" (click)="$event.stopPropagation()">

      <!-- Modal header -->
      <div class="mh">
        <div class="mh-left">
          <div class="mh-ico">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          </div>
          <div>
            <h2>Visite Médicale</h2>
            <p *ngIf="sel">{{ sel.patientName }} &mdash; Dossier #{{ sel.medicalFileId }}</p>
          </div>
        </div>
        <button class="mc-btn" (click)="close()">✕</button>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button [class.active]="tab==='form'" (click)="tab='form'">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
          Nouvelle Visite
        </button>
        <button [class.active]="tab==='history'" (click)="tab='history'">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Historique
          <span class="hist-count" *ngIf="histEntries.length > 0">{{ histEntries.length }}</span>
        </button>
        <button [class.active]="tab==='full'" (click)="openFullRecordTab()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3 12.75h6m-6-3h6M5.25 18.75h-.75A2.25 2.25 0 012.25 16.5V7.5A2.25 2.25 0 014.5 5.25h9a2.25 2.25 0 012.25 2.25v1.5"/></svg>
          Dossier
        </button>
      </div>

      <!-- ── FORM TAB ── -->
      <div class="mb" *ngIf="tab==='form'">
        <!-- Patient info grid -->
        <div class="info-grid">
          <div class="ii"><label>Nom</label><div class="iv">{{ sel?.patientName || '—' }}</div></div>
          <div class="ii"><label>Email</label><div class="iv">{{ sel?.patientEmail || '—' }}</div></div>
          <div class="ii"><label>Dernière Visite</label><div class="iv last-v">{{ derniereVisite || 'Jamais' }}</div></div>
          <div class="ii"><label>Maladie chronique</label><div class="iv">{{ sel?.chronicDisease || '—' }}</div></div>
        </div>

        <!-- Filière dropdown -->
        <div class="fg">
          <label class="fl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
            Filière *
          </label>
          <div class="sel-wrap">
            <select id="filiere-select" [(ngModel)]="form.filiere" class="form-sel">
              <option value="">-- Sélectionner une filière --</option>
              <option value="Récupération des dépenses">Récupération des dépenses</option>
              <option value="Filière public">Filière public</option>
              <option value="Médecin de famille">Médecin de famille</option>
            </select>
            <svg class="sel-arr" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
          </div>
        </div>

        <!-- Affecter Prescriptions -->
        <div class="fg" *ngIf="sel?.existingPrescriptions?.length">
          <label class="fl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3 12.75h6m-6-3h6M5.25 18.75h-.75A2.25 2.25 0 012.25 16.5V7.5A2.25 2.25 0 014.5 5.25h9a2.25 2.25 0 012.25 2.25v1.5"/></svg>
            Affecter des prescriptions existantes
          </label>
          <div class="pr-list">
            <label *ngFor="let pr of sel!.existingPrescriptions" class="pr-item">
              <input type="checkbox" [checked]="isPrescriptionSelected(pr)" (change)="togglePrescription(pr)" />
              <div class="pr-info">
                <strong>Ordonnance #{{pr.prescriptionId}}</strong>
                <span class="pr-date">{{ pr.date | date:'dd/MM/yyyy' }}</span>
                <p class="pr-note" *ngIf="pr.note">{{pr.note}}</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Visit notes -->
        <div class="fg">
          <label class="fl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
            Notes de la visite *
          </label>
          <textarea id="visit-note" [(ngModel)]="form.visitNote" rows="3" placeholder="Observations, diagnostic, recommandations..." class="form-ta"></textarea>
        </div>

        <!-- Blood analysis -->
        <div class="section-divider">
          <div class="sd-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            Analyse Sanguine
          </div>
        </div>
        <div class="fg">
          <label class="fl">Résultats / Observations</label>
          <textarea id="blood-analysis" [(ngModel)]="form.analyseSanguine" rows="2" placeholder="Glycémie, numération, groupe sanguin, autres examens..." class="form-ta form-ta-red"></textarea>
        </div>

        <!-- Vaccination with Button -->
        <div class="section-divider">
          <div class="sd-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
            Vaccination
          </div>
        </div>
        <div class="fg">
          <div class="vaccin-list" *ngIf="form.vaccines.length > 0">
            <div *ngFor="let v of form.vaccines; let i = index" class="vaccin-item">
              <div class="vi-info">
                <strong>{{ v.nom }}</strong> <span class="vi-type">{{ v.type }}</span>
                <p>{{ v.observation }}</p>
              </div>
              <button class="vi-btn-del" (click)="removeVaccine(i)">✕</button>
            </div>
          </div>
          <button class="btn-vaccin" (click)="openVaccineModal()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Ajouter un vaccin
          </button>
        </div>

        <!-- Urinaire Button -->
        <div class="section-divider">
          <div class="sd-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3 12.75h6m-6-3h6M5.25 18.75h-.75A2.25 2.25 0 012.25 16.5V7.5A2.25 2.25 0 014.5 5.25h9a2.25 2.25 0 012.25 2.25v1.5"/></svg>
            Appareil Urinaire
          </div>
        </div>
        <div class="fg">
          <div class="vaccin-list" *ngIf="form.appareilUrinaire || form.urinaryExams.length > 0">
            <div class="vaccin-item" style="border-left-color: #0ea5e9;">
              <div class="vi-info">
                <strong>Détails Urinaires Renseignés</strong>
                <p>{{ form.urinaryExams.length }} examen(s) au tableau enregistré(s).</p>
              </div>
            </div>
          </div>
          <button class="btn-vaccin" style="border-color: #0ea5e9; color: #0284c7; background: #f0f9ff;" (click)="openUrinaryModal()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Détails Appareil Urinaire
          </button>
        </div>

        <!-- Autre signaler -->
        <div class="section-divider">
          <div class="sd-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            A signaler
          </div>
        </div>
        <div class="fg">
          <textarea id="autre-signaler" [(ngModel)]="form.autre" rows="2" placeholder="Autres observations ou incidents particuliers..." class="form-ta form-ta-warn"></textarea>
        </div>

        <!-- Feedback banners -->
        <div class="succ-bar" *ngIf="saveSuccess">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
          Visite enregistrée avec succès !
        </div>
        <div class="err-bar" *ngIf="saveError">⚠ {{ saveError }}</div>
      </div>

      <!-- ── HISTORY TAB ── -->
      <div class="mb" *ngIf="tab==='history'">
        <div *ngIf="histEntries.length === 0" class="no-hist">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Aucun historique pour ce patient</span>
        </div>
        <div *ngFor="let entry of histEntries; let i = index" class="hist-card">
          <div class="hc-header">
            <span class="hc-num">Visite #{{ histEntries.length - i }}</span>
            <span class="hc-date">{{ extractDate(entry) }}</span>
          </div>
          <pre class="hc-body">{{ stripDate(entry) }}</pre>
        </div>
      </div>

      <!-- ── FULL RECORD TAB ── -->
      <div class="mb" *ngIf="tab==='full'">
        <div *ngIf="loadingFullRecord" class="no-hist">
          <div class="spinner-sm sp-white" style="position:relative; right:auto; border-top-color:#6366f1; border-width:3px; width:24px; height:24px; margin-bottom:1rem;"></div>
          <span>Chargement...</span>
        </div>
        <div *ngIf="!loadingFullRecord && !fullRecord" class="no-hist">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span>Aucun dossier médical trouvé pour ce patient</span>
        </div>
        <div *ngIf="!loadingFullRecord && fullRecord">
          <div class="info-grid">
            <div class="ii"><label>Image / Labo</label><div class="iv">{{fullRecord.imageLabo || '—'}}</div></div>
            <div class="ii"><label>Résultat IA</label><div class="iv">{{fullRecord.result_ia || '—'}}</div></div>
            <div class="ii"><label>Type / Catégorie</label><div class="iv">{{fullRecord.type || fullRecord.category || '—'}}</div></div>
            <div class="ii"><label>Score de santé global</label><div class="iv last-v" [class.text-green-600]="fullRecord.healthScore >= 75" [class.text-red-600]="fullRecord.healthScore < 50">{{fullRecord.healthScore}}<span style="font-size:0.75rem; color:#94a3b8">/100</span></div></div>
          </div>
          
          <div *ngIf="fullRecord.imageUrl">
            <div class="section-divider"><div class="sd-label">Image Médicale IA</div></div>
            <img [src]="fullRecord.imageUrl" alt="IA result" style="width:100%; max-height:200px; object-fit:contain; border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; padding:0.5rem;"/>
          </div>

          <div class="section-divider">
            <div class="sd-label">Documents Patient (Analyses, Scanners)</div>
          </div>
          <div *ngIf="fullRecord.patientImages && fullRecord.patientImages.length > 0" style="display:flex; gap:10px; flex-wrap:wrap;">
            <div *ngFor="let img of fullRecord.patientImages" style="border:1px solid #e2e8f0; padding:4px; border-radius:8px; background:#fff;">
               <a [href]="getImageUrl(img)" target="_blank" style="text-decoration:none; color:#6366f1; font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:0.25rem;">
                  <span *ngIf="img.toLowerCase().endsWith('.pdf')" style="padding:0.5rem;">📄 Voir PDF</span>
                  <img *ngIf="!img.toLowerCase().endsWith('.pdf')" [src]="getImageUrl(img)" style="max-width:100px; max-height:100px; display:block; border-radius:4px;" />
               </a>
            </div>
          </div>
          <div *ngIf="!fullRecord.patientImages || fullRecord.patientImages.length === 0" style="color:#94a3b8; font-size:0.875rem; text-align:center; padding:1rem 0;">
             Aucun document additionnel n'a été ajouté par le patient.
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mf">
        <button class="btn-cancel" (click)="close()">Fermer</button>
        <button *ngIf="tab==='form'" class="btn-valid" (click)="validate()" [disabled]="saving || !formIsValid()">
          <span *ngIf="!saving">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            Valider la visite
          </span>
          <span *ngIf="saving" class="spinner-sm sp-white"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- ─── SUB-MODAL VACCIN ────────────────────────────────────────────────────────── -->
  <div class="overlay ov-high" *ngIf="showVaccineModal" (click)="closeVaccineModal()">
    <div class="modal vac-modal" (click)="$event.stopPropagation()">
      <div class="vm-hdr">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
        Nouveau Vaccin
      </div>
      <div class="vm-body">
        <div class="fg">
          <label class="fl">Vaccin</label>
          <div style="display:flex;gap:.5rem;">
            <input type="text" [(ngModel)]="vacForm.nom" class="form-inp" style="flex:1" placeholder="Nom du vaccin...">
            <button class="btn-sec" (click)="vacForm.nom='Convention'">Convention</button>
            <button class="btn-sec" (click)="vacForm.nom='Tous'">Tous</button>
          </div>
        </div>
        <div class="fg">
          <label class="fl">Type</label>
          <input type="text" [(ngModel)]="vacForm.type" class="form-inp" placeholder="Type / lot...">
        </div>
        <div class="fg">
          <label class="fl">Observation</label>
          <input type="text" [(ngModel)]="vacForm.observation" class="form-inp" placeholder="Réactions, prochain rappel...">
        </div>
      </div>
      <div class="vm-foot">
        <button class="btn-valid vm-btn-ok" (click)="saveVaccine()" [disabled]="!vacForm.nom">OK ✓</button>
        <button class="btn-cancel vm-btn-no" (click)="closeVaccineModal()">Annuler ✕</button>
      </div>
    </div>
  </div>

  <!-- ─── SUB-MODAL URINAIRE ────────────────────────────────────────────────────────── -->
  <div class="overlay ov-high" *ngIf="showUrinaryModal" (click)="closeUrinaryModal()">
    <div class="modal vac-modal" style="max-width: 800px;" (click)="$event.stopPropagation()">
      <div class="vm-hdr" style="background: linear-gradient(180deg,#f0f9ff 0%,#e0f2fe 100%); color: #0369a1; border-bottom: 1px solid #bae6fd;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3 12.75h6m-6-3h6M5.25 18.75h-.75A2.25 2.25 0 012.25 16.5V7.5A2.25 2.25 0 014.5 5.25h9a2.25 2.25 0 012.25 2.25v1.5"/></svg>
        Urinaire
      </div>
      <div class="vm-body">
        <div class="fg">
          <label class="fl">Appareil Urinaire</label>
          <textarea [(ngModel)]="form.appareilUrinaire" rows="2" class="form-ta" style="border-color: #bae6fd;" placeholder="Observations..."></textarea>
        </div>
        
        <div class="fg">
          <label class="fl" style="margin-top:1rem; border-top:1px dashed #bae6fd; padding-top:1rem;">Tableau d'examens (Ajouter un élément)</label>
          <div style="display:flex; flex-wrap:wrap; gap:.5rem; margin-bottom:.75rem;">
            <input type="text" [(ngModel)]="urForm.libelle" class="form-inp" style="flex:1; min-width: 130px;" placeholder="Libellé">
            <input type="date" [(ngModel)]="urForm.date" class="form-inp" style="flex:1; min-width: 120px;" placeholder="Date">
            <input type="text" [(ngModel)]="urForm.malAnt" class="form-inp" style="flex:1; min-width: 100px;" placeholder="Mal Ant.">
            <input type="text" [(ngModel)]="urForm.categorie" class="form-inp" style="flex:1; min-width: 100px;" placeholder="Catégorie">
            <input type="text" [(ngModel)]="urForm.nTabMp" class="form-inp" style="flex:1; min-width: 90px;" placeholder="N° Tab MP">
            <input type="date" [(ngModel)]="urForm.dDec" class="form-inp" style="flex:1; min-width: 120px;" placeholder="D.Déc">
            <input type="text" [(ngModel)]="urForm.aCausal" class="form-inp" style="flex:1; min-width: 100px;" placeholder="A.Causal">
            <button class="btn-sec" style="background:#0284c7; color:white;" (click)="addUrinaryRow()">+</button>
          </div>
          
          <div class="tbl-card" style="max-height: 200px; overflow-y: auto;">
            <table class="ptbl" style="font-size: .75rem;">
              <thead style="background: #0284c7;"><tr>
                <th>Libellé</th><th>Date</th><th>Mal Ant.</th><th>Catégorie</th><th>N° Tab MP</th><th>D.Déc</th><th>A.Causal</th><th></th>
              </tr></thead>
              <tbody>
                <tr *ngIf="form.urinaryExams.length === 0"><td colspan="8" style="text-align:center; padding:.75rem; color:#94a3b8;">Aucun examen au tableau</td></tr>
                <tr *ngFor="let u of form.urinaryExams; let idx=index" style="background:white; border-bottom:1px solid #eee;">
                  <td>{{u.libelle}}</td><td>{{u.date}}</td><td>{{u.malAnt}}</td><td>{{u.categorie}}</td>
                  <td>{{u.nTabMp}}</td><td>{{u.dDec}}</td><td>{{u.aCausal}}</td>
                  <td><button class="vi-btn-del" (click)="removeUrinaryRow(idx)" style="color:#ef4444; border:none; background:none; font-size:1.1rem; cursor:pointer;">✕</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="vm-foot">
        <button class="btn-valid" style="background:linear-gradient(to bottom, #7dd3fc, #0ea5e9); color:#fff; min-width:100px; border:none;" (click)="closeUrinaryModal()">Terminer</button>
      </div>
    </div>
  </div>

</div>
  `,
  styles: [`
    .pw { padding: 2rem; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }

    /* Header */
    .ph { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.75rem; }
    .ph-left { display: flex; align-items: center; gap: 1rem; }
    .ph-ico { width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(99,102,241,.35);flex-shrink:0; }
    .ph-ico svg { width:26px;height:26px;color:#fff; }
    .ph h1 { font-size:1.5rem;font-weight:700;color:#1e293b;margin:0; }
    .ph p  { font-size:.875rem;color:#64748b;margin:.2rem 0 0; }
    .stat-badge { display:flex;flex-direction:column;align-items:center;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:14px;padding:.7rem 1.2rem;box-shadow:0 4px 14px rgba(99,102,241,.3); }
    .sn { font-size:1.6rem;font-weight:800;line-height:1; }
    .sl { font-size:.7rem;opacity:.85; }

    /* Search */
    .s-wrap { margin-bottom:1.5rem; }
    .s-box  { position:relative;display:flex;align-items:center; }
    .s-ico  { position:absolute;left:1rem;width:20px;height:20px;color:#94a3b8;pointer-events:none; }
    .s-inp  { width:100%;padding:.875rem 1rem .875rem 3rem;border:2px solid #e2e8f0;border-radius:14px;font-size:.95rem;color:#1e293b;background:#fff;outline:none;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.04); }
    .s-inp:focus { border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.1); }
    .s-inp::placeholder { color:#94a3b8; }

    /* Spinner small */
    .spinner-sm { position:absolute;right:1rem;width:18px;height:18px;border:2.5px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite; }
    .sp-white { position:static;border-color:rgba(255,255,255,.35);border-top-color:#fff; }

    /* Error / success banners */
    .err-bar  { display:flex;align-items:center;gap:.5rem;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:10px;padding:.75rem 1rem;font-size:.85rem;margin-top:.75rem; }
    .succ-bar { display:flex;align-items:center;gap:.6rem;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:10px;padding:.75rem 1rem;font-size:.875rem;font-weight:500;margin-top:.75rem; }
    .succ-bar svg,.succ-bar svg { width:18px;height:18px; }

    /* Table */
    .tbl-card { background:#fff;border-radius:18px;border:1px solid #e2e8f0;box-shadow:0 4px 20px rgba(0,0,0,.06);overflow:hidden; }
    .ptbl { width:100%;border-collapse:collapse; }
    .ptbl thead tr { background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%); }
    .ptbl th { padding:1rem 1.25rem;text-align:left;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.9);white-space:nowrap; }
    .ptbl td { padding:1rem 1.25rem;border-bottom:1px solid #f1f5f9; }
    .prow { cursor:pointer;transition:background .15s; }
    .prow:hover { background:#f5f3ff; }
    .prow:last-child td { border-bottom:none; }
    .dos-badge { display:inline-flex;align-items:center;background:#ede9fe;color:#7c3aed;font-size:.8rem;font-weight:700;padding:.25rem .65rem;border-radius:8px; }
    .p-cell { display:flex;align-items:center;gap:.75rem; }
    .av { width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:.75rem;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .pname { font-weight:600;color:#1e293b; }
    .em { color:#64748b;font-size:.875rem; }
    .ch-tag { display:inline-block;background:#fef3c7;color:#92400e;font-size:.75rem;font-weight:600;border-radius:8px;padding:.2rem .6rem; }
    .nd { color:#cbd5e1; }
    .empty { text-align:center;padding:3rem !important;color:#94a3b8; }
    .empty svg { width:48px;height:48px;display:block;margin:0 auto .75rem; }
    .btn-visite { display:flex;align-items:center;gap:.4rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;padding:.45rem 1rem;border-radius:10px;font-size:.78rem;font-weight:600;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(99,102,241,.3);transition:all .18s; }
    .btn-visite:hover { transform:translateY(-1px);box-shadow:0 4px 14px rgba(99,102,241,.4); }
    .btn-visite svg { width:14px;height:14px; }

    /* Skeleton */
    .skrow td { padding:1.1rem 1.25rem !important; }
    .skel { height:14px;border-radius:6px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:400% 100%;animation:shimmer 1.2s ease infinite; }
    .sw60{width:60px}.sw80{width:80px}.sw100{width:100px}.sw130{width:130px}.sw200{width:200px}.sh28{height:28px!important;border-radius:8px;}

    /* Modal Main */
    .overlay { position:fixed;inset:0;z-index:900;background:rgba(15,23,42,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn .18s ease; }
    .ov-high { z-index:1100; }
    .modal   { background:#fff;border-radius:22px;width:100%;max-width:660px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:slideUp .22s ease; display:flex; flex-direction:column; }
    .mh { display:flex;align-items:flex-start;justify-content:space-between;padding:1.5rem 1.75rem 0; flex-shrink:0; }
    .mh-left { display:flex;align-items:center;gap:1rem; }
    .mh-ico { width:48px;height:48px;border-radius:14px;flex-shrink:0;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(99,102,241,.3); }
    .mh-ico svg { width:24px;height:24px;color:#fff; }
    .mh h2 { font-size:1.2rem;font-weight:700;color:#1e293b;margin:0; }
    .mh p  { font-size:.8rem;color:#6366f1;margin:.2rem 0 0;font-weight:500; }
    .mc-btn { background:#f8fafc;border:none;cursor:pointer;padding:.4rem .55rem;border-radius:8px;color:#94a3b8;font-size:1.1rem;transition:all .15s; }
    .mc-btn:hover { background:#fee2e2;color:#ef4444; }

    /* Tabs */
    .tabs { display:flex;gap:.5rem;padding:1rem 1.75rem .5rem; flex-shrink:0; }
    .tabs button { display:flex;align-items:center;gap:.4rem;padding:.5rem 1rem;border:2px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s; }
    .tabs button svg { width:15px;height:15px; }
    .tabs button.active { background:linear-gradient(135deg,#6366f1,#8b5cf6);border-color:transparent;color:#fff;box-shadow:0 3px 10px rgba(99,102,241,.3); }
    .hist-count { background:rgba(255,255,255,.3);border-radius:20px;padding:.05rem .45rem;font-size:.7rem;font-weight:700; }
    .tabs button:not(.active) .hist-count { background:#e0e7ff;color:#6366f1; }

    .mb { padding:1.25rem 1.75rem; flex:1; overflow-y:auto; }

    /* Info grid */
    .info-grid { display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin-bottom:1.25rem; }
    .ii { background:#f8fafc;border-radius:10px;padding:.75rem 1rem; }
    .ii label { font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;font-weight:600;display:block;margin-bottom:.3rem; }
    .iv { font-size:.88rem;font-weight:600;color:#1e293b; }
    .last-v { color:#6366f1; font-weight:700; }

    /* Form fields */
    .fg { margin-bottom:1.1rem; }
    .fl { display:flex;align-items:center;gap:.4rem;font-size:.875rem;font-weight:600;color:#374151;margin-bottom:.5rem; }
    .fl svg { width:16px;height:16px;color:#6366f1; }
    .form-ta,.form-inp { width:100%;padding:.8rem 1rem;border:2px solid #e2e8f0;border-radius:12px;font-size:.875rem;color:#1e293b;outline:none;transition:border .2s;font-family:inherit;box-sizing:border-box; }
    .form-ta { line-height:1.6;resize:vertical; }
    .form-ta:focus,.form-inp:focus { border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.1); }
    .form-ta-red:focus { border-color:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.1); }
    .form-ta-green:focus { border-color:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.1); }
    .form-ta-warn:focus { border-color:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.1); }

    /* Dropdown select */
    .sel-wrap { position:relative; }
    .form-sel { width:100%;padding:.8rem 2.5rem .8rem 1rem;border:2px solid #e2e8f0;border-radius:12px;font-size:.875rem;color:#1e293b;background:#fff;outline:none;appearance:none;cursor:pointer;transition:border .2s;font-family:inherit; }
    .form-sel:focus { border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.1); }
    .sel-arr { position:absolute;right:.85rem;top:50%;transform:translateY(-50%);width:16px;height:16px;color:#94a3b8;pointer-events:none; }

    /* Prescription list */
    .pr-list { display:flex; flex-direction:column; gap:.5rem; max-height:180px; overflow-y:auto; border:2px solid #e2e8f0; border-radius:12px; padding:.5rem; background:#f8fafc; }
    .pr-item { display:flex; align-items:flex-start; gap:.75rem; padding:.6rem; border-radius:8px; cursor:pointer; background:#fff; border:1px solid #f1f5f9; transition:border-color .2s; }
    .pr-item:hover { border-color:#cbd5e1; }
    .pr-item input { margin-top:.25rem; accent-color:#6366f1; width:16px; height:16px; cursor:pointer; }
    .pr-info { display:flex; flex-direction:column; }
    .pr-info strong { font-size:.85rem; color:#1e293b; }
    .pr-date { font-size:.7rem; color:#64748b; font-weight:600; margin-bottom:.15rem; }
    .pr-note { font-size:.8rem; color:#475569; margin:0; line-height:1.4; }

    /* Section dividers */
    .section-divider { display:flex;align-items:center;gap:.75rem;margin:1.25rem 0 .75rem; }
    .section-divider::before,.section-divider::after { content:'';flex:1;height:1px;background:#e2e8f0; }
    .sd-label { display:flex;align-items:center;gap:.4rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.07em;font-weight:700;color:#6366f1;white-space:nowrap; }
    .sd-label svg { width:15px;height:15px; }

    /* Vaccins sub-modal & button */
    .btn-vaccin { display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.7rem 1.25rem;border:2px dashed #22c55e;border-radius:12px;background:#f0fdf4;color:#15803d;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .18s;width:100%; }
    .btn-vaccin:hover { background:#dcfce7;border-color:#16a34a; }
    .btn-vaccin svg { width:16px;height:16px; }
    .btn-sec { padding:0 .85rem; background:#f1f5f9; border:none; border-radius:8px; font-size:.8rem; font-weight:600; color:#475569; cursor:pointer; transition:background .15s; white-space:nowrap; }
    .btn-sec:hover { background:#e2e8f0; }
    .vaccin-list { display:flex; flex-direction:column; gap:.5rem; margin-bottom:.75rem; }
    .vaccin-item { display:flex; justify-content:space-between; align-items:center; padding:.75rem; background:#fff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 1px 4px rgba(0,0,0,.03); border-left:4px solid #22c55e; }
    .vi-info strong { font-size:.85rem; color:#1e293b; }
    .vi-type { font-size:.7rem; background:#f1f5f9; color:#64748b; padding:.1rem .4rem; border-radius:4px; margin-left:.5rem; }
    .vi-info p { font-size:.75rem; color:#64748b; margin:.2rem 0 0; }
    .vi-btn-del { border:none; background:none; color:#cbd5e1; cursor:pointer; font-size:1.1rem; padding:.2rem; transition:color .15s; }
    .vi-btn-del:hover { color:#ef4444; }

    .vac-modal { max-width:480px; background:#e0f2fe; border:1px solid #bae6fd; } /* Blue tint like the image */
    .vm-hdr { background:linear-gradient(180deg,#f0f9ff 0%,#e0f2fe 100%); padding:.75rem 1.25rem; font-weight:700; color:#0369a1; display:flex; align-items:center; gap:.5rem; border-bottom:1px solid #bae6fd; border-radius:22px 22px 0 0; }
    .vm-hdr svg { width:18px;height:18px; }
    .vm-body { padding:1.25rem; }
    .vm-foot { padding:.75rem; display:flex; justify-content:center; gap:1rem; border-top:1px solid #bae6fd; background:#f0f9ff; border-radius:0 0 22px 22px;}
    .vm-btn-ok { background:linear-gradient(to bottom, #86efac, #22c55e); color:#fff; min-width:100px; box-shadow:0 2px 5px rgba(34,197,94,.2); }
    .vm-btn-no { background:linear-gradient(to bottom, #fde047, #eab308); color:#854d0e; min-width:100px; border:1px solid #facc15; }

    /* History entries */
    .no-hist { display:flex;flex-direction:column;align-items:center;gap:.75rem;color:#94a3b8;padding:2rem 0;text-align:center; }
    .no-hist svg { width:48px;height:48px; }
    .hist-card { background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;margin-bottom:1rem;overflow:hidden; }
    .hc-header { display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;background:#6366f1;color:#fff; }
    .hc-num  { font-size:.8rem;font-weight:700; }
    .hc-date { font-size:.75rem;opacity:.85; }
    .hc-body { margin:0;padding:.85rem 1rem;font-size:.82rem;color:#334155;white-space:pre-wrap;font-family:'Courier New',monospace;line-height:1.7;max-height:200px;overflow-y:auto; }

    /* Footer */
    .mf { display:flex;align-items:center;justify-content:flex-end;gap:.75rem;padding:1.25rem 1.75rem;border-top:1px solid #f1f5f9; flex-shrink:0;}
    .btn-cancel { padding:.65rem 1.4rem;border:2px solid #e2e8f0;border-radius:12px;background:#fff;color:#475569;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .18s; }
    .btn-cancel:hover { background:#f8fafc; }
    .btn-valid  { display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.7rem 1.75rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;font-size:.9rem;font-weight:700;cursor:pointer;min-width:140px;box-shadow:0 4px 14px rgba(99,102,241,.35);transition:all .18s; }
    .btn-valid:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.4); }
    .btn-valid:disabled { opacity:.6;cursor:not-allowed;transform:none; }
    .btn-valid svg { width:15px;height:15px; }

    @keyframes spin     { to { transform:rotate(360deg); } }
    @keyframes shimmer  { 0%{background-position:100% 0}100%{background-position:-100% 0} }
    @keyframes fadeIn   { from{opacity:0}  to{opacity:1} }
    @keyframes slideUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class PatientRecordsComponent implements OnInit {
  searchTerm = '';
  patients: PatientRecordDTO[] = [];
  loading = false;
  error = '';
  sk = Array(5);

  showModal = false;
  sel: PatientRecordDTO | null = null;
  tab: 'form' | 'history' | 'full' = 'form';
  histEntries: string[] = [];
  derniereVisite = '';

  fullRecord: any = null;
  loadingFullRecord = false;

  form: HistoryRequest = { filiere: '', visitNote: '', analyseSanguine: '', vaccination: '', prescriptions: [], autre: '', vaccines: [], appareilUrinaire: '', urinaryExams: [] };
  saving = false;
  saveSuccess = false;
  saveError = '';

  // Vaccin Modal
  showVaccineModal = false;
  vacForm: VaccineRequest = { nom: '', type: '', observation: '' };

  // Urinaire Modal
  showUrinaryModal = false;
  urForm: UrinaryExamRequest = { libelle: '', date: '', malAnt: '', categorie: '', nTabMp: '', dDec: '', aCausal: '' };

  private search$ = new Subject<string>();
  private api = `${environment.baseUrl}/medical-records`;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.search$.pipe(debounceTime(400)).subscribe(t => this.fetch(t));
    this.fetch('');
  }

  onSearch(t: string) { this.search$.next(t); }

  fetch(name: string) {
    this.loading = true; this.error = '';
    this.http.get<PatientRecordDTO[]>(`${this.api}/patients/search?name=${encodeURIComponent(name)}`).subscribe({
      next: d => { this.patients = d; this.loading = false; },
      error: e => { this.error = 'Erreur chargement patients.'; this.loading = false; console.error(e); }
    });
  }

  openForm(p: PatientRecordDTO) {
    this.sel = p;
    this.tab = 'form';
    this.fullRecord = null;
    this.form = { filiere: '', visitNote: '', analyseSanguine: '', vaccination: '', prescriptions: [], autre: '', vaccines: [], appareilUrinaire: '', urinaryExams: [] };
    this.saveSuccess = false; this.saveError = '';
    this.histEntries = this.parseHistory(p.medicalHistory);
    this.derniereVisite = this.histEntries.length > 0 ? this.extractDate(this.histEntries[0]) : 'Jamais';
    this.showModal = true;
  }

  close() { if (this.saving) return; this.showModal = false; this.sel = null; }

  // ── Prescriptions Multi-select ──
  isPrescriptionSelected(pr: PrescriptionMinimalDTO): boolean {
    return this.form.prescriptions.includes(pr.prescriptionId.toString());
  }
  togglePrescription(pr: PrescriptionMinimalDTO) {
    const id = pr.prescriptionId.toString();
    const idx = this.form.prescriptions.indexOf(id);
    if (idx > -1) {
      this.form.prescriptions.splice(idx, 1);
    } else {
      this.form.prescriptions.push(id);
    }
  }

  // ── Dossier Complet ──
  openFullRecordTab() {
    this.tab = 'full';
    if (!this.fullRecord && this.sel) {
      this.loadingFullRecord = true;
      this.http.get(`${this.api}/${this.sel.medicalFileId}`).subscribe({
        next: (res) => {
          this.fullRecord = res;
          this.loadingFullRecord = false;
        },
        error: (err) => {
          console.error('Erreur chargement dossier complet:', err);
          this.loadingFullRecord = false;
        }
      });
    }
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.baseUrl}${path}`;
  }

  // ── Vaccin Modal ──
  openVaccineModal() {
    this.vacForm = { nom: '', type: '', observation: '' };
    this.showVaccineModal = true;
  }
  closeVaccineModal() {
    this.showVaccineModal = false;
  }
  saveVaccine() {
    if (!this.vacForm.nom) return;
    this.form.vaccines.push({ ...this.vacForm });
    this.closeVaccineModal();
  }
  removeVaccine(idx: number) {
    this.form.vaccines.splice(idx, 1);
  }

  // ── Urinaire Modal ──
  openUrinaryModal() {
    this.urForm = { libelle: '', date: '', malAnt: '', categorie: '', nTabMp: '', dDec: '', aCausal: '' };
    this.showUrinaryModal = true;
  }
  closeUrinaryModal() {
    this.showUrinaryModal = false;
  }
  addUrinaryRow() {
    if (!this.urForm.libelle) return;
    this.form.urinaryExams.push({ ...this.urForm });
    this.urForm = { libelle: '', date: '', malAnt: '', categorie: '', nTabMp: '', dDec: '', aCausal: '' };
  }
  removeUrinaryRow(idx: number) {
    this.form.urinaryExams.splice(idx, 1);
  }

  formIsValid(): boolean {
    return !!((this.form.visitNote || '').trim() || (this.form.analyseSanguine || '').trim() ||
      this.form.vaccines?.length > 0 || this.form.prescriptions?.length > 0 || (this.form.autre || '').trim() ||
      (this.form.appareilUrinaire || '').trim() || this.form.urinaryExams?.length > 0);
  }

  validate() {
    if (!this.sel) return;
    if (!this.formIsValid()) return;
    this.saving = true; this.saveSuccess = false; this.saveError = '';

    this.http.post(`${this.api}/${this.sel.medicalFileId}/history`, this.form).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.saveSuccess = true;

        if (this.sel && res?.medical_historuy !== undefined) {
          this.sel.medicalHistory = res.medical_historuy;
        } else if (this.sel) {
          // Fallback UI generation
          const ts = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          let built = `─── Visite du ${ts} ───`;
          if (this.form.filiere) built += `\nFilière       : ${this.form.filiere}`;
          if (this.form.visitNote) built += `\nNotes         : ${this.form.visitNote}`;
          if (this.form.analyseSanguine) built += `\nAnalyse sang. : ${this.form.analyseSanguine}`;
          if (this.form.autre) built += `\nA Signaler    : ${this.form.autre}`;
          this.sel.medicalHistory = this.sel.medicalHistory
            ? this.sel.medicalHistory + '\n\n' + built : built;
        }

        this.histEntries = this.parseHistory(this.sel?.medicalHistory || '');
        this.derniereVisite = this.histEntries.length > 0 ? this.extractDate(this.histEntries[0]) : 'Jamais';
        this.form = { filiere: '', visitNote: '', analyseSanguine: '', vaccination: '', prescriptions: [], autre: '', vaccines: [], appareilUrinaire: '', urinaryExams: [] };

        // Refresh local search to get potentially updated history in background
        this.fetch(this.searchTerm);
      },
      error: e => {
        this.saving = false;
        this.saveError = `Erreur enregistrement (${e.status}).`;
        console.error(e);
      }
    });
  }

  /** Split medical_historuy into individual visit entries by the separator line */
  parseHistory(raw: string): string[] {
    if (!raw || !raw.trim()) return [];
    return raw.split(/\n\n(?=─{3})/).filter(e => e.trim()).reverse();
  }

  extractDate(entry: string): string {
    const m = entry.match(/─{3} Visite du (.+?) ─{3}/);
    return m ? m[1] : '';
  }

  stripDate(entry: string): string {
    return entry.replace(/─{3} Visite du .+? ─{3}\n?/, '').trim();
  }

  initials(name: string): string {
    if (!name) return '?';
    const p = name.trim().split(/\s+/);
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.trim().slice(0, 2).toUpperCase();
  }
}
