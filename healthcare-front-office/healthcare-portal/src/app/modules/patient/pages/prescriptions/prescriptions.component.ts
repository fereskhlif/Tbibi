import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActeDTO, PrescriptionRequest, PrescriptionResponse, PrescriptionService, PrescriptionStatus, STATUS_META } from '../../../../services/prescription-service.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import jsPDF from 'jspdf';

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
  
  renewalsRequested = new Set<number>();


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
      rxId: rx.prescriptionID,
      medicineName: 'Prescription Tracking',
      daysLeft: diffDays,
      type: type,
      message: msg,
      color: color,
      bgLabel: bgLabel
    });
    
    return cards;
  }

  requestRenewal(rxId: number, event: Event): void {
    event.stopPropagation();
    if (this.renewalsRequested.has(rxId)) return;

    this.prescriptionService.renewPrescription(rxId).subscribe({
      next: () => {
        this.renewalsRequested.add(rxId);
        // Refresh after a short delay
        setTimeout(() => this.loadAll(), 2000);
      },
      error: () => alert('Erreur lors de la demande de renouvellement')
    });
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

  exportToPDF(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header background
    doc.setFillColor(14, 165, 233); // Cyan-500
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Header Text
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Prescription", pageWidth / 2, 22, { align: "center" });

    // Prescription Meta
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    const dateStr = rx.date ? new Date(rx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
    doc.text(`Date: ${dateStr}`, 14, 50);
    doc.text(`Prescription ID: #${rx.prescriptionID}`, pageWidth - 14, 50, { align: "right" });

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 55, pageWidth - 14, 55);

    // Doctor & Patient Info Block
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Prescribing Doctor", 14, 68);
    doc.text("Patient Information", pageWidth / 2, 68);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Dr. ${rx.doctorName || 'Not Assigned'}`, 14, 76);
    doc.text(`Patient: ${rx.patientName || 'Tbibi Patient'}`, pageWidth / 2, 76);

    doc.line(14, 85, pageWidth - 14, 85);

    // Note Section
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Notes & Instructions", 14, 98);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const splitNote = doc.splitTextToSize(rx.note || 'No additional notes provided.', pageWidth - 28);
    doc.text(splitNote, 14, 106);

    // Calculate new Y after notes
    let currentY = 106 + (splitNote.length * 5) + 8;
    doc.line(14, currentY, pageWidth - 14, currentY);

    // Medicines List
    currentY += 12;
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Prescribed Medicines", 14, currentY);

    currentY += 10;
    if (rx.medicines && rx.medicines.length > 0) {
      // Table Header
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(14, currentY, pageWidth - 28, 10, 'F');

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Medicine Name", 20, currentY + 7);
      doc.text("Quantity", pageWidth - 20, currentY + 7, { align: "right" });

      currentY += 16;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold"); // slight bold for meds

      rx.medicines.forEach((m) => {
        // Add page if near bottom
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }

        doc.setTextColor(14, 165, 233); // cyan-500
        doc.text(`• ${m.medicineName}`, 16, currentY);
        doc.setTextColor(71, 85, 105);
        doc.text(`x${m.quantity}`, pageWidth - 20, currentY, { align: "right" });
        currentY += 10;
      });
    } else {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      doc.text("No medicines prescribed.", 14, currentY);
      currentY += 10;
    }

    // Footer
    const totalPages = (<any>doc.internal).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('Document digitally generated securely via Tbibi Healthcare Portal.', pageWidth / 2, 285, { align: 'center' });
    }

    doc.save(`Medical_Prescription_${rx.prescriptionID}.pdf`);
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
