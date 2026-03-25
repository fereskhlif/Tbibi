import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActeDTO,
  PrescriptionRequest,
  PrescriptionResponse,
  PrescriptionService,
  PrescriptionStatus,
  STATUS_META,
} from '../../../../services/prescription-service.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-prescriptions',
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.css']
})
export class PrescriptionsComponent implements OnInit, OnDestroy {

  prescriptions: PrescriptionResponse[] = [];
  actes: ActeDTO[] = [];
  loading = false;
  loadingActes = false;
  error = '';

  // ── Detail modal ──────────────────────────────────────────────────────────
  showDetail = false;
  detailRx: PrescriptionResponse | null = null;
  
  showActeModal = false;
  acteForRx: ActeDTO | null = null;


  // ── Filter / sort ─────────────────────────────────────────────────────────
  activeFilter: PrescriptionStatus | 'ALL' = 'ALL';
  sortDesc = true;
  selectedDoctorId: number | null = null;

  // ── Status polling (every 30 s for "real-time" feel) ─────────────────────
  private pollSub?: Subscription;

  // Expose to template
  STATUS_META = STATUS_META;
  statusKeys: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'DISPENSED', 'COMPLETED', 'CANCELLED'];
  readonly STEPS: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'DISPENSED', 'COMPLETED'];

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void {
    this.loadAll();
    // Poll every 30 seconds to refresh statuses
    this.pollSub = interval(30_000)
      .pipe(switchMap(() => this.prescriptionService.getMyPrescriptions()))
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

  // ── Data ──────────────────────────────────────────────────────────────────

  loadAll(): void {
    this.loading = true;
    this.loadingActes = true;
    this.error = '';

    // Load prescriptions
    this.prescriptionService.getMyPrescriptions().subscribe({
      next: (data) => {
        this.prescriptions = data.map(rx => ({ ...rx, expanded: false }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des données.';
        this.loading = false;
      }
    });

    // Load actes
    this.prescriptionService.getMyActes().subscribe({
      next: (data) => {
        this.actes = data;
        this.loadingActes = false;
      },
      error: () => {
        this.loadingActes = false;
      }
    });
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  /** Unique list of doctors sorted by name, extracted from loaded prescriptions and actes. */
  get doctors(): { doctorId: number; doctorName: string }[] {
    const map = new Map<number, string>();
    this.prescriptions.forEach(rx => {
      if (rx.doctorId != null && rx.doctorName) {
        map.set(rx.doctorId, rx.doctorName);
      }
    });
    this.actes.forEach(a => {
      if (a.doctorId != null && a.doctorName) {
        map.set(a.doctorId, a.doctorName);
      }
    });
    return Array.from(map.entries())
      .map(([doctorId, doctorName]) => ({ doctorId, doctorName }))
      .sort((a, b) => a.doctorName.localeCompare(b.doctorName));
  }

  get filtered(): PrescriptionResponse[] {
    let list = this.activeFilter === 'ALL'
      ? [...this.prescriptions]
      : this.prescriptions.filter(rx => rx.status === this.activeFilter);

    // Doctor filter
    if (this.selectedDoctorId !== null) {
      list = list.filter(rx => rx.doctorId === this.selectedDoctorId);
    }

    list.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return this.sortDesc ? -diff : diff;
    });
    return list;
  }

  get filteredActes(): ActeDTO[] {
    let list = [...this.actes];

    if (this.selectedDoctorId !== null) {
      list = list.filter(a => a.doctorId === this.selectedDoctorId);
    }

    list.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return this.sortDesc ? timeB - timeA : timeA - timeB;
    });
    return list;
  }

  countByStatus(s: PrescriptionStatus): number {
    return this.prescriptions.filter(rx => rx.status === s).length;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  statusMeta(status: PrescriptionStatus) {
    return STATUS_META[status] ?? STATUS_META['PENDING'];
  }

  stepOf(status: PrescriptionStatus): number {
    return this.STEPS.indexOf(status);
  }

  // ── Detail modal ──────────────────────────────────────────────────────────

  openEditModal(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    alert("Veuillez contacter votre médecin pour modifier cette prescription.");
  }

  deletePrescription(id: number, event?: Event): void {
    event?.stopPropagation();
    if(confirm('Êtes-vous sûr de vouloir supprimer cette prescription ?')) {
      this.prescriptionService.delete(id).subscribe({
        next: () => this.loadAll(),
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }

  showActesForRx(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    const relatedActes = this.actes.filter(a => a.acteId === rx.acteId);
    if (relatedActes.length > 0) {
      this.acteForRx = relatedActes[0];
      this.showActeModal = true;
    } else {
      alert("Aucun acte médical relié à cette prescription.");
    }
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



  trackById(_: number, rx: PrescriptionResponse): number {
    return rx.prescriptionID;
  }
}