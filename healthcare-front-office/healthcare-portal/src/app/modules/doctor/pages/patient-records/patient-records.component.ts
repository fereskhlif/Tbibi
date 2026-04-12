import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { debounceTime, Subject, interval, Subscription } from 'rxjs';
import { PrescriptionService, PrescriptionResponse } from '../../../../services/prescription-service.service';

export interface PrescriptionMinimalDTO {
  prescriptionId: number;
  note: string;
  date: string;
  status: string;
  doctorName?: string;
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
  vaccination: string;
  prescriptions: string[];
  autre: string;
  vaccines: VaccineRequest[];
  appareilUrinaire: string;
  urinaryExams: UrinaryExamRequest[];
}

@Component({
  selector: 'app-patient-records',
  standalone: false,
  templateUrl: './patient-records.component.html',
  styleUrls: ['./patient-records.component.css']
})
export class PatientRecordsComponent implements OnInit, OnDestroy {

  // ── Liste & Recherche ──────────────────────────────────────────────────────
  searchTerm = '';
  patients: PatientRecordDTO[] = [];
  loading = false;
  error = '';
  sk = Array(5);
  pollSub?: Subscription;

  // ── Modal principal ────────────────────────────────────────────────────────
  showModal = false;
  sel: PatientRecordDTO | null = null;
  tab: 'form' | 'history' | 'full' = 'form';
  histEntries: string[] = [];
  derniereVisite = '';

  // ── Dossier complet ────────────────────────────────────────────────────────
  fullRecord: any = null;
  loadingFullRecord = false;

  showMedicalRecordSum = true;

  // ── Formulaire de visite ───────────────────────────────────────────────────
  form: HistoryRequest = {
    filiere: '',
    visitNote: '',
    analyseSanguine: '',
    vaccination: '',
    prescriptions: [],
    autre: '',
    vaccines: [],
    appareilUrinaire: '',
    urinaryExams: []
  };
  saving = false;
  saveSuccess = false;
  saveError = '';
  lastSavedPrescriptions: string[] = [];

  // ── Constantes Vitales ─────────────────────────────────────────────────────
  vitals = { tensionSys: null as number | null, tensionDia: null as number | null, poids: null as number | null, glycemie: null as number | null, temperature: null as number | null };


  // ── Sub-modal Vaccin ───────────────────────────────────────────────────────
  showVaccineModal = false;
  vacForm: VaccineRequest = { nom: '', type: '', observation: '' };

  // ── Sub-modal Urinaire ─────────────────────────────────────────────────────
  showUrinaryModal = false;
  urForm: UrinaryExamRequest = { libelle: '', date: '', malAnt: '', categorie: '', nTabMp: '', dDec: '', aCausal: '' };

  private search$ = new Subject<string>();
  private api = `${environment.baseUrl}/medical-records`;
  // ── Prescription details modal ──────────────────────────────────────────────
  selectedPrescription: PrescriptionResponse | null = null;
  loadingPrescription = false;

  constructor(private http: HttpClient, private prescriptionService: PrescriptionService) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.search$.pipe(debounceTime(400)).subscribe(t => {
      this.searchTerm = t;
      this.fetch(t);
    });
    this.fetch('');

    // Polling pour actualiser la liste automatiquement
    this.pollSub = interval(30_000).subscribe(() => {
      if (!this.showModal && !this.loading) {
        this.fetchQuietly(this.searchTerm);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
  }

  // ── Recherche ──────────────────────────────────────────────────────────────
  onSearch(t: string): void {
    this.search$.next(t);
  }

  fetch(name: string): void {
    this.loading = true;
    this.error = '';
    this.http.get<PatientRecordDTO[]>(`${this.api}/patients/search?name=${encodeURIComponent(name)}`).subscribe({
      next: d => { this.patients = d; this.loading = false; },
      error: e => { this.error = 'Error loading patients.'; this.loading = false; console.error(e); }
    });
  }

  fetchQuietly(name: string): void {
    this.http.get<PatientRecordDTO[]>(`${this.api}/patients/search?name=${encodeURIComponent(name)}`).subscribe({
      next: d => { this.patients = d; },
      error: e => { console.error('Auto refresh error:', e); }
    });
  }

  // ── Modal principal ────────────────────────────────────────────────────────
  openForm(p: PatientRecordDTO): void {
    this.sel = p;
    this.tab = 'form';
    this.fullRecord = null;
    this.form = {
      filiere: '', visitNote: '', analyseSanguine: '', vaccination: '',
      prescriptions: [], autre: '', vaccines: [], appareilUrinaire: '', urinaryExams: []
    };
    this.saveSuccess = false;
    this.saveError = '';
    this.vitals = { tensionSys: null, tensionDia: null, poids: null, glycemie: null, temperature: null };
    this.histEntries = this.parseHistory(p.medicalHistory);
    this.derniereVisite = this.histEntries.length > 0 ? this.extractDate(this.histEntries[0]) : 'Never';
    this.showModal = true;
  }

  close(): void {
    if (this.saving) return;
    this.showModal = false;
    this.sel = null;
  }

  // ── Prescriptions Multi-select ─────────────────────────────────────────────
  isPrescriptionSelected(pr: PrescriptionMinimalDTO): boolean {
    return this.form.prescriptions.includes(pr.prescriptionId.toString());
  }

  togglePrescription(pr: PrescriptionMinimalDTO): void {
    const id = pr.prescriptionId.toString();
    const idx = this.form.prescriptions.indexOf(id);
    if (idx > -1) {
      this.form.prescriptions.splice(idx, 1);
    } else {
      this.form.prescriptions.push(id);
    }
  }

  openPrescription(id: number): void {
    this.loadingPrescription = true;
    this.prescriptionService.getById(id).subscribe({
      next: (data) => {
        this.selectedPrescription = data;
        this.loadingPrescription = false;
      },
      error: (err) => {
        console.error('Failed to load prescription', err);
        this.loadingPrescription = false;
      }
    });
  }

  closePrescription(): void {
    this.selectedPrescription = null;
  }

  // ── Dossier complet ────────────────────────────────────────────────────────
  openFullRecordTab(): void {
    this.tab = 'full';
    if (this.sel) {
      this.loadingFullRecord = true;
      this.http.get(`${this.api}/${this.sel.medicalFileId}`).subscribe({
        next: (res) => { this.fullRecord = res; this.loadingFullRecord = false; },
        error: (err) => { console.error('Error loading full record:', err); this.loadingFullRecord = false; }
      });
    }
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.baseUrl}${path}`;
  }

  // ── Sub-modal Vaccin ───────────────────────────────────────────────────────
  openVaccineModal(): void {
    this.vacForm = { nom: '', type: '', observation: '' };
    this.showVaccineModal = true;
  }

  closeVaccineModal(): void {
    this.showVaccineModal = false;
  }

  saveVaccine(): void {
    if (!this.vacForm.nom) return;
    this.form.vaccines.push({ ...this.vacForm });
    this.closeVaccineModal();
  }

  removeVaccine(idx: number): void {
    this.form.vaccines.splice(idx, 1);
  }

  // ── Sub-modal Urinaire ─────────────────────────────────────────────────────
  openUrinaryModal(): void {
    this.urForm = { libelle: '', date: '', malAnt: '', categorie: '', nTabMp: '', dDec: '', aCausal: '' };
    this.showUrinaryModal = true;
  }

  closeUrinaryModal(): void {
    this.showUrinaryModal = false;
  }

  addUrinaryRow(): void {
    if (!this.urForm.libelle) return;
    this.form.urinaryExams.push({ ...this.urForm });
    this.urForm = { libelle: '', date: '', malAnt: '', categorie: '', nTabMp: '', dDec: '', aCausal: '' };
  }

  removeUrinaryRow(idx: number): void {
    this.form.urinaryExams.splice(idx, 1);
  }

  // ── Validation formulaire ──────────────────────────────────────────────────
  formIsValid(): boolean {
    const hasVitals = this.vitals.tensionSys !== null || this.vitals.poids !== null ||
                      this.vitals.glycemie !== null || this.vitals.temperature !== null;
    return !!(
      hasVitals ||
      (this.form.visitNote      || '').trim() ||
      (this.form.analyseSanguine || '').trim() ||
      this.form.vaccines?.length > 0           ||
      this.form.prescriptions?.length > 0      ||
      (this.form.autre          || '').trim() ||
      (this.form.appareilUrinaire || '').trim() ||
      this.form.urinaryExams?.length > 0
    );
  }

  // ── Vital Signs helpers ────────────────────────────────────────────────────
  tensionState(): 'normal' | 'warn' | 'danger' {
    const s = this.vitals.tensionSys, d = this.vitals.tensionDia;
    if (s !== null && s >= 14) return 'danger';
    if (d !== null && d >= 9)  return 'danger';
    if (s !== null && s >= 13) return 'warn';
    return 'normal';
  }

  temperatureState(): 'normal' | 'warn' | 'danger' {
    const t = this.vitals.temperature;
    if (t === null) return 'normal';
    if (t >= 39.5) return 'danger';
    if (t >= 38)   return 'warn';
    return 'normal';
  }

  glycemieState(): 'normal' | 'warn' | 'danger' {
    const g = this.vitals.glycemie;
    if (g === null) return 'normal';
    if (g > 2.0) return 'danger';
    if (g > 1.6) return 'warn';
    return 'normal';
  }

  // ── Enregistrement visite ──────────────────────────────────────────────────
  validate(): void {
    if (!this.sel) return;
    if (!this.formIsValid()) return;

    this.saving = true;
    this.saveSuccess = false;
    this.saveError = '';

    this.http.post(`${this.api}/${this.sel.medicalFileId}/history`, this.form).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.saveSuccess = true;

        if (this.sel && res?.medical_historuy !== undefined) {
          this.sel.medicalHistory = res.medical_historuy;
        } else if (this.sel) {
          // Fallback : construction locale de l'entrée d'historique
          const ts = new Date().toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });
          let built = `─── Visit on ${ts} ───`;
          if (this.form.filiere)         built += `\nCategory      : ${this.form.filiere}`;
          // Include vitals summary
          const v = this.vitals;
          const vParts: string[] = [];
          if (v.tensionSys !== null || v.tensionDia !== null) vParts.push(`BP: ${v.tensionSys ?? '?'}/${v.tensionDia ?? '?'} mmHg`);
          if (v.poids       !== null) vParts.push(`Weight: ${v.poids} kg`);
          if (v.glycemie    !== null) vParts.push(`Glucose: ${v.glycemie} g/L`);
          if (v.temperature !== null) vParts.push(`Temp: ${v.temperature} °C`);
          if (vParts.length > 0) built += `\nVitals        : ${vParts.join(' | ')}`;
          if (this.form.visitNote)       built += `\nNotes         : ${this.form.visitNote}`;
          if (this.form.analyseSanguine) built += `\nBlood Test    : ${this.form.analyseSanguine}`;
          if (this.form.prescriptions?.length) built += `\nPrescriptions : ${this.form.prescriptions.join(' | ')}`;
          if (this.form.autre)           built += `\nReport        : ${this.form.autre}`;
          this.sel.medicalHistory = this.sel.medicalHistory
            ? this.sel.medicalHistory + '\n\n' + built
            : built;
        }

        this.histEntries = this.parseHistory(this.sel?.medicalHistory || '');
        this.derniereVisite = this.histEntries.length > 0 ? this.extractDate(this.histEntries[0]) : 'Never';
        this.lastSavedPrescriptions = [...this.form.prescriptions];

        // Réinitialisation du formulaire
        this.vitals = { tensionSys: null, tensionDia: null, poids: null, glycemie: null, temperature: null };
        this.form = {
          filiere: '', visitNote: '', analyseSanguine: '', vaccination: '',
          prescriptions: [], autre: '', vaccines: [], appareilUrinaire: '', urinaryExams: []
        };

        // Rafraîchir la liste en arrière-plan
        this.fetch(this.searchTerm);
      },
      error: e => {
        this.saving = false;
        this.saveError = `Failed to record visit (${e.status}).`;
        console.error(e);
      }
    });
  }

  // ── Utilitaires historique ─────────────────────────────────────────────────
  parseHistory(raw: string): string[] {
    if (!raw || !raw.trim()) return [];
    return raw.split(/\n\n(?=─{3})/).filter(e => e.trim()).reverse();
  }

  extractDate(entry: string): string {
    const m = entry.match(/─{3} (?:Visite du|Visit on) (.+?) ─{3}/);
    return m ? m[1] : '';
  }

  stripDate(entry: string): string {
    return entry.replace(/─{3} (?:Visite du|Visit on) .+? ─{3}\n?/, '').trim();
  }

  // ── Utilitaire affichage ───────────────────────────────────────────────────
  initials(name: string): string {
    if (!name) return '?';
    const p = name.trim().split(/\s+/);
    return p.length >= 2
      ? (p[0][0] + p[1][0]).toUpperCase()
      : name.trim().slice(0, 2).toUpperCase();
  }
}
