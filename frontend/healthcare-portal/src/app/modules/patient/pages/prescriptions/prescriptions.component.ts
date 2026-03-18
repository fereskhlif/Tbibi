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
  styles: [`
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse-ring { 0% { box-shadow:0 0 0 0 rgba(59,130,246,0.4); } 70% { box-shadow:0 0 0 8px rgba(59,130,246,0); } 100% { box-shadow:0 0 0 0 rgba(59,130,246,0); } }
    @keyframes shimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
    .rx-card { animation:fadeUp 0.35s ease both; transition:box-shadow 0.2s,transform 0.2s; }
    .rx-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.08); }
    .status-pending { animation:pulse-ring 2s infinite; }
    .progress-track { position:relative; display:flex; align-items:center; justify-content:space-between; }
    .progress-track::before { content:''; position:absolute; top:50%; left:0; right:0; height:3px; background:#e5e7eb; transform:translateY(-50%); z-index:0; }
    .progress-fill { position:absolute; top:50%; left:0; height:3px; background:linear-gradient(90deg,#3b82f6,#8b5cf6); transform:translateY(-50%); transition:width 0.6s ease; z-index:1; }
    .step-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; position:relative; z-index:2; transition:all 0.3s; }
    .skeleton { background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:400px 100%; animation:shimmer 1.4s ease-in-out infinite; border-radius:8px; }
    .modal-overlay { backdrop-filter:blur(4px); animation:fadeUp 0.2s ease; }
    .rotate-180 { transform:rotate(180deg); }
  `]
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

  // ── Add / Edit modal ──────────────────────────────────────────────────────
  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  saving = false;

  form: PrescriptionRequest = { note: '', date: '' };

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

  openDetail(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    this.detailRx = { ...rx };
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.detailRx = null;
  }

  // ── Add / Edit modal ──────────────────────────────────────────────────────

  openAddModal(): void {
  this.editMode = false;
  this.selectedId = null;
  
  // ✅ FORMAT ISO COMPLET avec secondes et millisecondes
  const now = new Date();
  
  // Méthode 1: toISOString() donne automatiquement "2026-02-28T16:00:00.000Z"
  const isoString = now.toISOString();
  
  this.form = { 
    note: '', 
    date: isoString
  };
  
  console.log('📅 Date envoyée:', isoString); // Vérification
  this.showModal = true;
}

openEditModal(rx: PrescriptionResponse, event?: Event): void {
  event?.stopPropagation();
  this.editMode = true;
  this.selectedId = rx.prescriptionID;
  
  // ✅ Pour l'édition, convertir la date reçue en format ISO
  const dateObj = new Date(rx.date);
  this.form = {
    note: rx.note,
    date: dateObj.toISOString()  // ← Convertir au bon format
  };
  this.showModal = true;
}

 save(): void {
  if (this.saving) return;
  
  // ✅ S'assurer que la date est au bon format avant envoi
  let dateToSend = this.form.date;
  
  // Si la date n'a pas de secondes, les ajouter
  if (dateToSend && dateToSend.length === 16) { // Format "2026-02-28T16:00"
    dateToSend = dateToSend + ':00.000Z';
  }
  
  const dataToSend = {
    note: this.form.note,
    date: dateToSend
  };
  
  console.log('📤 Données à envoyer:', dataToSend);
  
  this.saving = true;

  const obs = this.editMode && this.selectedId !== null
    ? this.prescriptionService.update(this.selectedId, dataToSend)
    : this.prescriptionService.add(dataToSend);

  obs.subscribe({
    next: (response) => {
      console.log('✅ Réponse:', response);
      this.showModal = false;
      this.saving = false;
      this.loadAll();
    },
    error: (err) => {
      console.error('❌ Erreur:', err);
      this.error = this.editMode ? 'Erreur modification' : "Erreur ajout";
      this.saving = false;
    }
  });
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