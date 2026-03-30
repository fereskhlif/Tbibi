import { Component, OnInit } from '@angular/core';
import { PrescriptionService, PrescriptionResponse, PatientDTO, STATUS_META, PrescriptionStatus } from '../../../../services/prescription-service.service';

@Component({
  selector: 'app-prescription-receiving',
  templateUrl: './prescription-receiving.component.html',
  styleUrls: ['./prescription-receiving.component.css']
})
export class PrescriptionReceivingComponent implements OnInit {
  patients: PatientDTO[] = [];
  selectedPatientId: number | null = null;
  allPrescriptions: PrescriptionResponse[] = [];
  displayedPrescriptions: PrescriptionResponse[] = [];

  // Detail modal
  showDetail = false;
  detailRx: PrescriptionResponse | null = null;

  // Filter & sort
  activeFilter: PrescriptionStatus | 'ALL' = 'ALL';

  readonly STATUS_META = STATUS_META;
  readonly statusKeys: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'DISPENSED', 'COMPLETED', 'CANCELLED'];
  readonly STEPS: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'DISPENSED', 'COMPLETED'];

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadAllPrescriptions();
  }

  loadPatients(): void {
    this.prescriptionService.getAllPatients().subscribe({
      next: (data) => this.patients = data,
      error: (err) => console.error('Error loading patients', err)
    });
  }

  loadAllPrescriptions(): void {
    this.prescriptionService.getAll().subscribe({
      next: (data) => {
        this.allPrescriptions = data;
        this.filterPrescriptions();
      },
      error: (err) => console.error('Error loading prescriptions', err)
    });
  }

  onPatientSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPatientId = value ? Number(value) : null;
    this.activeFilter = 'ALL';
    this.filterPrescriptions();
  }

  filterPrescriptions(): void {
    if (this.selectedPatientId) {
      this.displayedPrescriptions = this.allPrescriptions.filter(
        rx => rx.patientId === this.selectedPatientId
      );
    } else {
      this.displayedPrescriptions = [];
    }
  }

  get filtered(): PrescriptionResponse[] {
    if (this.activeFilter === 'ALL') return this.displayedPrescriptions;
    return this.displayedPrescriptions.filter(rx => rx.status === this.activeFilter);
  }

  countByStatus(s: PrescriptionStatus): number {
    return this.displayedPrescriptions.filter(rx => rx.status === s).length;
  }

  stepOf(status: PrescriptionStatus): number {
    return this.STEPS.indexOf(status);
  }

  openDetail(rx: PrescriptionResponse): void {
    this.detailRx = { ...rx };
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.detailRx = null;
  }

  updateStatus(rx: PrescriptionResponse, newStatus: PrescriptionStatus): void {
    this.prescriptionService.updateStatus(rx.prescriptionID, newStatus).subscribe({
      next: (updatedRx) => {
        const index = this.allPrescriptions.findIndex(p => p.prescriptionID === updatedRx.prescriptionID);
        if (index !== -1) {
          updatedRx.patientName = this.allPrescriptions[index].patientName;
          updatedRx.patientId = this.allPrescriptions[index].patientId;
          updatedRx.doctorName = this.allPrescriptions[index].doctorName;
          updatedRx.doctorId = this.allPrescriptions[index].doctorId;
          this.allPrescriptions[index] = updatedRx;
          this.filterPrescriptions();
        }
      },
      error: (err) => console.error('Error updating status', err)
    });
  }

  getMedicineCount(rx: PrescriptionResponse): number {
    return rx.medicines ? rx.medicines.length : 0;
  }
}
