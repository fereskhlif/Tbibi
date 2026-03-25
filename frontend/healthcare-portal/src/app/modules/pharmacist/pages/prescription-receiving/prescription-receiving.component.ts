import { Component, OnInit } from '@angular/core';
import { PrescriptionService, PrescriptionResponse, PatientDTO, STATUS_META, PrescriptionStatus } from '../../../../services/prescription-service.service';

@Component({
  selector: 'app-prescription-receiving',
  templateUrl: './prescription-receiving.component.html'
})
export class PrescriptionReceivingComponent implements OnInit {
  patients: PatientDTO[] = [];
  selectedPatientId: number | null = null;
  allPrescriptions: PrescriptionResponse[] = [];
  displayedPrescriptions: PrescriptionResponse[] = [];

  readonly STATUS_META = STATUS_META;

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
