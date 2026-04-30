import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActeDTO,
  PatientDTO,
  PatientReportDTO,
  PrescriptionRequest,
  PrescriptionResponse,
  PrescriptionService,
  PrescriptionStatus,
  STATUS_META,
} from '../../../../services/prescription-service.service';
import { interval, Subscription, forkJoin } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-doctor-prescriptions',
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.css']
})
export class DoctorPrescriptionsComponent implements OnInit, OnDestroy {
  acteSearch = '';
  patientSearch = '';
  actes: ActeDTO[] = [];
  patients: PatientDTO[] = [];
  showAssignModal = false;
  assigningRx: PrescriptionResponse | null = null;
  selectedActeId: number | null = null;
  selectedIds: Set<number> = new Set<number>();

  prescriptions: PrescriptionResponse[] = [];
  loading = false;
  error = '';

  showDetail = false;
  detailRx: PrescriptionResponse | null = null;

  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  saving = false;

  showPatientReportModal = false;
  patientReport: PatientReportDTO | null = null;
  loadingReport = false;

  form: any = { patientId: null, acteDescription: '', typeOfActe: 'PRESCRIPTION', typeCategory: 'PRESCRIPTION', analysisSubType: '', note: '', date: '', duration: null, expirationDate: null };

  activeFilter: PrescriptionStatus | 'ALL' = 'ALL';
  sortDesc = true;

  private pollSub?: Subscription;

  STATUS_META = STATUS_META;
  statusKeys: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'DISPENSED', 'COMPLETED', 'CANCELLED'];
  readonly STEPS: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'DISPENSED', 'COMPLETED'];

  activePrescriptionsWarning: any[] = [];
  checkingActivePrescriptions = false;

  showRecentModal = false;
  recentActes: any[] = [];
  loadingRecent = false;

  // AI substitutes state
  medicineInput = '';
  indicationInput = '';
  familleInput = '';
  checkingSubstitute = false;
  aiSuggestions: any[] = [];
  addedMedicines: any[] = [];
  medicineCheckStatus = '';
  currentSearch = '';

  predictingClass = false;
  predictedClassResponse: any = null;
  predictedClassError: string = '';
  outOfStockWarning = false;
  syncingAI = false;

  constructor(private prescriptionService: PrescriptionService, private http: HttpClient) {}

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

    if (this.patientSearch.trim()) {
      const q = this.patientSearch.toLowerCase();
      list = list.filter(rx => rx.patientName?.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const timeA = a.statusUpdatedAt ? new Date(a.statusUpdatedAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
      const timeB = b.statusUpdatedAt ? new Date(b.statusUpdatedAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
      return this.sortDesc ? timeB - timeA : timeA - timeB;
    });
    return list;
  }

  getTrackingCards(rx: PrescriptionResponse): any[] {
    const cards: any[] = [];
    if (!rx.expirationDate || rx.status === 'CANCELLED') return cards;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(rx.expirationDate);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let type = '';
    let msg = '';
    let color = '';
    let bgLabel = '';

    if (diffDays > 3) {
      type = 'GREEN';
      msg = `You have ${diffDays} days of treatment remaining.`;
      color = 'border-green-200 bg-green-50 text-green-800';
      bgLabel = 'bg-green-100 text-green-700';
    } else if (diffDays <= 3 && diffDays > 0) {
      type = 'ORANGE';
      msg = `You have ${diffDays} days left. Remember to see the doctor.`;
      color = 'border-orange-200 bg-orange-50 text-orange-800';
      bgLabel = 'bg-orange-100 text-orange-700';
    } else {
      type = 'RED';
      msg = 'Expired! Do not take this medication without consulting a doctor.';
      color = 'border-red-200 bg-red-50 text-red-800';
      bgLabel = 'bg-red-100 text-red-700';
    }

    cards.push({
      medicineName: 'Prescription Tracking',
      daysLeft: diffDays,
      type: type,
      message: msg,
      color: color,
      bgLabel: bgLabel
    });
    
    return cards;
  }

  get minDate(): string {
    return new Date().toISOString().slice(0, 16);
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

  viewPatientReport(patientId?: number) {
    if (!patientId) {
      alert("Ce patient n'a pas d'ID associé.");
      return;
    }
    this.showPatientReportModal = true;
    this.loadingReport = true;
    this.patientReport = null;

    this.prescriptionService.getPatientReport(patientId).subscribe({
      next: (report: PatientReportDTO) => {
        this.patientReport = report;
        this.loadingReport = false;
      },
      error: (err: any) => {
        console.error("Erreur chargement rapport", err);
        this.loadingReport = false;
        this.showPatientReportModal = false;
        alert("Impossible de charger le dossier complet pour le moment.");
      }
    });
  }

  closePatientReport() {
    this.showPatientReportModal = false;
    this.patientReport = null;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.detailRx = null;
  }

  openAddModal(): void {
    this.editMode = false;
    this.selectedId = null;
    this.activePrescriptionsWarning = [];
    const isoString = new Date().toISOString();
    // Use local formatted date for the HTML datetime-local input
    const localDateTime = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    this.form = { patientId: null, acteDescription: '', typeOfActe: 'PRESCRIPTION', typeCategory: 'PRESCRIPTION', analysisSubType: '', note: '', date: localDateTime, duration: null, expirationDate: null, rxOriginalDate: null };
    
    // Reset AI state
    this.addedMedicines = [];
    this.medicineInput = '';
    this.indicationInput = '';
    this.familleInput = '';
    this.aiSuggestions = [];
    this.medicineCheckStatus = '';
    this.predictedClassResponse = null;
    this.predictedClassError = '';
    
    console.log('📅 Date envoyée:', isoString);
    this.showModal = true;
  }

  onPatientChange(patientId: number): void {
    if (!patientId) {
      this.activePrescriptionsWarning = [];
      return;
    }
    this.checkingActivePrescriptions = true;
    this.http.get<any[]>(`${environment.baseUrl}/actes/active-prescriptions-for-patient/${patientId}`).subscribe({
      next: (res) => {
        this.activePrescriptionsWarning = res;
        this.checkingActivePrescriptions = false;
      },
      error: (err) => {
        console.error('Error checking active prescriptions', err);
        this.checkingActivePrescriptions = false;
      }
    });
  }

  openRecentModal(): void {
    this.showRecentModal = true;
    this.loadingRecent = true;
    this.recentActes = [];
    this.http.get<any[]>(`${environment.baseUrl}/actes/recent-active-prescriptions-for-doctor`).subscribe({
      next: (res) => {
        this.recentActes = res;
        this.loadingRecent = false;
      },
      error: (err) => {
        console.error('Error loading recent actes', err);
        this.loadingRecent = false;
      }
    });
  }

  closeRecentModal(): void {
    this.showRecentModal = false;
  }

  onTypeChange(value: string): void {
    this.form.typeCategory = value;
    this.form.analysisSubType = '';
    if (value !== 'ANALYSE') {
      this.form.typeOfActe = value;
    } else {
      this.form.typeOfActe = 'ANALYSE';
    }
  }

  onAnalysisSubTypeChange(value: string): void {
    this.form.analysisSubType = value;
    this.form.typeOfActe = value;
  }

  onDurationChange(): void {
    const days = parseInt(this.form.duration, 10);
    if (!isNaN(days) && days > 0) {
      // Calculate from today for new prescriptions, or original date if editing
      const baseDate = this.editMode && this.form.rxOriginalDate ? new Date(this.form.rxOriginalDate) : new Date();
      const expDate = new Date(baseDate);
      expDate.setDate(expDate.getDate() + days);
      // Use noon (12:00) to avoid UTC offset flipping the date ±1 day
      expDate.setHours(12, 0, 0, 0);
      this.form.expirationDate = expDate.toISOString();
      this.form.duration = days; // normalize back to number
    } else {
      this.form.expirationDate = null;
    }
  }

  addMedicine(): void {
    if ((!this.medicineInput.trim() && !this.indicationInput.trim() && !this.familleInput.trim()) || !this.form.patientId) return;
    this.checkingSubstitute = true;
    this.medicineCheckStatus = '';
    this.aiSuggestions = [];

    this.prescriptionService.checkSubstitutes({
      medicineName: this.medicineInput,
      patientId: this.form.patientId,
      indication: this.indicationInput ? this.indicationInput.trim() : '',
      famille: this.familleInput ? this.familleInput.trim() : ''
    }).subscribe({
      next: (res) => {
        this.checkingSubstitute = false;
        this.currentSearch = '';
        if (res.available) {
          this.addedMedicines.push({ name: this.medicineInput });
          this.medicineInput = '';
          this.indicationInput = '';
          this.familleInput = '';
          this.medicineCheckStatus = 'Médicament disponible en stock. Ajouté. ' + (res.statusMessage || '');
          this.outOfStockWarning = false;
        } else {
          this.outOfStockWarning = true;
          this.medicineCheckStatus = res.statusMessage || 'Médicament indisponible.';
          const alts = res.aiAlternatives?.alternatives ?? [];
          if (alts.length === 0) {
            // AI returned no valid substitute: message is already set above
            if (!this.medicineCheckStatus.includes('Aucun')) {
              this.medicineCheckStatus = 'Aucun substitut cliniquement valide trouvé par l\'IA.';
            }
          }
          // Sort: in-stock first, then by clinical score descending
          this.aiSuggestions = alts.sort((a: any, b: any) => {
            if (a.inStock && !b.inStock) return -1;
            if (!a.inStock && b.inStock) return 1;
            return (b.score ?? 0) - (a.score ?? 0);
          });
        }
      },
      error: () => {
        this.checkingSubstitute = false;
        this.currentSearch = '';
        this.medicineCheckStatus = 'Erreur lors de la vérification. Veuillez réessayer.';
      }
    });
  }

  predictTherapeuticClass(): void {
    if (!this.form.patientId || (!this.indicationInput.trim() && !this.form.note.trim())) return;
    
    const indicationToUse = this.indicationInput.trim() || this.form.note.trim();
    
    this.predictingClass = true;
    this.predictedClassResponse = null;
    this.predictedClassError = '';

    this.prescriptionService.predictTherapeuticClass({
      patientId: this.form.patientId,
      indication: indicationToUse
    }).subscribe({
      next: (res) => {
        this.predictingClass = false;
        if (res.error) {
          this.predictedClassError = res.message || res.error;
        } else {
          this.predictedClassResponse = res;
        }
      },
      error: (err) => {
        this.predictingClass = false;
        const errBody = err?.error;
        this.predictedClassError = errBody?.message || errBody?.error || 'Symptôme non reconnu comme une indication médicale.';
      }
    });
  }

  searchSpecific(type: string): void {
    this.currentSearch = type;
    // We do NOT clear the fields anymore, so we keep context.
    // However, if the user explicitly typed in only one and we want to know what they clicked...
    // For now we just trigger the check. The backend will receive everything.
    this.addMedicine();
  }

  selectSubstitute(sub: any): void {
    // Handles both snake_case (sous_classe) from Flask via Jackson and camelCase (sousClasse) from Angular serialization
    const displayName = sub.nom || sub.name || 'Médicament AI';
    const subClass = sub.sous_classe || sub.sousClasse || '';
    this.addedMedicines.push({
      name: displayName,
      source: 'AI',
      sousClasse: subClass,
      score: sub.score || 0
    });
    this.aiSuggestions = [];
    this.medicineInput = '';
    this.indicationInput = '';
    this.familleInput = '';
    this.medicineCheckStatus = `✅ Substitut IA sélectionné : ${displayName}${subClass ? ' (' + subClass + ')' : ''}`;
  }

  triggerManualAiSync(): void {
    this.syncingAI = true;
    this.medicineCheckStatus = '🔄 Synchronisation IA en cours...';
    this.prescriptionService.syncAi().subscribe({
      next: () => {
        this.syncingAI = false;
        this.medicineCheckStatus = '✅ IA synchronisée avec le stock !';
        setTimeout(() => this.medicineCheckStatus = '', 3000);
      },
      error: (err) => {
        this.syncingAI = false;
        this.medicineCheckStatus = '⚠️ Échec de la synchronisation IA.';
        console.error('AI Sync failed', err);
      }
    });
  }

  openEditModal(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    this.editMode = true;
    this.selectedId = rx.prescriptionID;
    this.form = {
      patientId: null, acteDescription: '', typeOfActe: '',
      note: rx.note,
      date: '', // Not shown/used when editing prescription
      duration: null,
      expirationDate: rx.expirationDate || null,
      rxOriginalDate: rx.date
    };
    
    // Reset AI state & populate if needed
    // Assuming UI display only, we map the medicines back if editing
    this.addedMedicines = rx.medicines ? rx.medicines.map((m: any) => ({ name: m.medicineName })) : [];
    this.medicineInput = '';
    this.indicationInput = '';
    this.familleInput = '';
    this.aiSuggestions = [];
    this.medicineCheckStatus = '';

    this.showModal = true;
  }

  openAssignModal(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    this.assigningRx = rx;
    this.selectedActeId = rx.acteId ?? null;
    this.showAssignModal = true;
  }

  validateRenewal(id: number, event: Event): void {
    event.stopPropagation();
    this.prescriptionService.updateStatus(id, 'VALIDATED').subscribe({
      next: () => {
        this.loadAll();
      },
      error: () => {
        this.error = 'Erreur lors de la validation.';
      }
    });
  }

  save(): void {
    if (this.saving) return;

    if (!this.editMode && !this.form.patientId) {
      this.error = 'Veuillez sélectionner un patient.';
      return;
    }
    if (!this.editMode && !this.form.acteDescription) {
      this.error = "Veuillez fournir une description pour l'acte.";
      return;
    }

    let acteDateToSend = this.form.date;
    if (acteDateToSend && acteDateToSend.length === 16) {
      acteDateToSend = acteDateToSend + ':00.000Z';
    }
    
    const rxDateToSend = this.editMode && this.form.rxOriginalDate 
                         ? this.form.rxOriginalDate 
                         : new Date().toISOString();

    const rxDataToSend = { note: this.form.note, date: rxDateToSend, expirationDate: this.form.expirationDate };

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
      const acteReq = {
        date: acteDateToSend,
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
          console.error('Erreur lors de la création unifiée:', err);
          throw err;
        })
      ).subscribe({
        next: () => {
          this.showModal = false;
          this.saving = false;
          this.loadAll();
          this.loadActes();
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
        this.selectedIds.delete(id);
        if (this.detailRx?.prescriptionID === id) this.closeDetail();
      },
      error: () => { this.error = 'Erreur lors de la suppression.'; }
    });
  }

  toggleSelection(id: number, event: Event): void {
    event.stopPropagation();
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleAll(event: Event): void {
    event.stopPropagation();
    const allIds = this.filtered.map(rx => rx.prescriptionID);
    if (this.selectedIds.size === allIds.length && allIds.length > 0) {
      this.selectedIds.clear();
    } else {
      allIds.forEach(id => this.selectedIds.add(id));
    }
  }

  deleteSelected(): void {
    if (this.selectedIds.size === 0) return;
    if (!confirm(`Voulez-vous vraiment supprimer les ${this.selectedIds.size} prescriptions sélectionnées ?`)) return;

    this.loading = true;
    const idsToDelete = Array.from(this.selectedIds);
    const deleteReqs = idsToDelete.map(id => this.prescriptionService.delete(id).pipe(
      catchError(err => of(null)) // Ignore errors for individual deletes to ensure forkJoin completes
    ));

    forkJoin(deleteReqs).subscribe({
      next: () => {
        this.loading = false;
        this.selectedIds.clear();
        this.loadAll();
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors de la suppression par lot.';
      }
    });
  }

  trackById(_: number, rx: PrescriptionResponse): number {
    return rx.prescriptionID;
  }
}
