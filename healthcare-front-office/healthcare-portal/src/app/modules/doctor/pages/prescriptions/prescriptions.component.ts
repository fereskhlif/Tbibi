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

  prescriptions: PrescriptionResponse[] = [];
  loading = false;
  error = '';

  showDetail = false;
  detailRx: PrescriptionResponse | null = null;

  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  saving = false;

  form: any = { patientId: null, acteDescription: '', typeOfActe: 'PRESCRIPTION', typeCategory: 'PRESCRIPTION', analysisSubType: '', note: '', date: '', duration: null, expirationDate: null };

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

    if (this.patientSearch.trim()) {
      const q = this.patientSearch.toLowerCase();
      list = list.filter(rx => rx.patientName?.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
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

  closeDetail(): void {
    this.showDetail = false;
    this.detailRx = null;
  }

  openAddModal(): void {
    this.editMode = false;
    this.selectedId = null;
    const isoString = new Date().toISOString();
    this.form = { patientId: null, acteDescription: '', typeOfActe: 'PRESCRIPTION', typeCategory: 'PRESCRIPTION', analysisSubType: '', note: '', date: isoString, duration: null, expirationDate: null };
    console.log('📅 Date envoyée:', isoString);
    this.showModal = true;
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
    if (this.form.duration && this.form.duration > 0) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + this.form.duration);
      this.form.expirationDate = currentDate.toISOString();
    } else {
      this.form.expirationDate = null;
    }
  }

  openEditModal(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    this.editMode = true;
    this.selectedId = rx.prescriptionID;
    this.form = {
      patientId: null, acteDescription: '', typeOfActe: '',
      note: rx.note,
      date: new Date(rx.date).toISOString(),
      duration: null,
      expirationDate: rx.expirationDate || null
    };
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

    let dateToSend = this.form.date;
    if (dateToSend && dateToSend.length === 16) {
      dateToSend = dateToSend + ':00.000Z';
    }
    const rxDataToSend = { note: this.form.note, date: dateToSend, expirationDate: this.form.expirationDate };

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
        if (this.detailRx?.prescriptionID === id) this.closeDetail();
      },
      error: () => { this.error = 'Erreur lors de la suppression.'; }
    });
  }

  trackById(_: number, rx: PrescriptionResponse): number {
    return rx.prescriptionID;
  }
}
