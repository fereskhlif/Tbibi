import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MedicalRecordsServiceService } from '../../../../services/medical-records-service.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-medical-records',
  templateUrl: './medical-records.component.html'
})
export class MedicalRecordsComponent implements OnInit {

  activeFilter = 'All';
  filters = ['All', 'Lab Reports', 'Prescriptions', 'Imaging', 'Consultations'];

  records: any[] = [];
  errorMessage = '';
  selectedRecord: any = null;
  showForm = false;
  isEditing = false;
  editIndex: number | null = null;
  editId: number | null = null;
  selectedFile: File | null = null;

  formMedicalRecord = new FormGroup({
    imageLabo: new FormControl('', Validators.required),
    result_ia: new FormControl('', Validators.required),
    medical_historuy: new FormControl('', [Validators.required, Validators.minLength(4)]),
    chronic_diseas: new FormControl(''),
  });

  constructor(private service: MedicalRecordsServiceService) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.service.getAll().subscribe({
      next: (data: any[]) => {
        this.errorMessage = '';
        this.records = (data || []).map(r => ({
          ...r,
          icon: r.icon ?? '🏥',
          bgColor: r.bgColor ?? 'bg-blue-50',
          status: r.status ?? 'Active',
          statusClass: r.statusClass ?? 'bg-blue-100 text-blue-700',
          type: r.type ?? r.category ?? 'Unknown',
        }));
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur chargement:', err);
        this.errorMessage = 'Impossible de charger les dossiers médicaux.';
        this.records = [];
      }
    });
  }

  get filteredRecords(): any[] {
    if (this.activeFilter === 'All') return this.records;
    return this.records.filter(r => r.type === this.activeFilter);
  }

  viewRecord(record: any): void {
    this.selectedRecord = record;
  }

  openAddForm(): void {
    this.isEditing = false;
    this.editIndex = null;
    this.editId = null;
    this.selectedFile = null;
    this.formMedicalRecord.reset();
    this.showForm = true;
  }

  openEditForm(record: any, index: number): void {
    this.isEditing = true;
    this.editIndex = index;
    this.editId = record.medicalfile_id;
    this.selectedFile = null;

    this.formMedicalRecord.patchValue({
      imageLabo: record.imageLabo,
      result_ia: record.result_ia,
      medical_historuy: record.medical_historuy,
      chronic_diseas: record.chronic_diseas,
    });

    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editIndex = null;
    this.editId = null;
    this.selectedFile = null;
    this.formMedicalRecord.reset();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    }
  }

  saveForm(): void {
  if (this.formMedicalRecord.invalid) return;

  const data = this.formMedicalRecord.value;

  if (this.isEditing && this.editId !== null) {
    this.service.update(this.editId, data).subscribe({
      next: (updated: any) => {
        const updatedRec = { ...updated, icon: '🏥', bgColor: 'bg-blue-50', status: 'Active', statusClass: 'bg-blue-100 text-blue-700', type: 'Lab Reports' };
        if (this.editIndex !== null) this.records[this.editIndex] = updatedRec;
        if (this.selectedRecord) this.selectedRecord = updatedRec;
        this.cancelForm();
      },
      error: (err) => console.error('Erreur update:', err)
    });
  } else {
    this.service.add(data).subscribe({
      next: (created: any) => {
        const newRec = { ...created, icon: '🏥', bgColor: 'bg-blue-50', status: 'Active', statusClass: 'bg-blue-100 text-blue-700', type: 'Lab Reports' };
        this.records.unshift(newRec);
        this.cancelForm();
      },
      error: (err) => console.error('Erreur add:', err)
    });
  }
}

  deleteRecord(index: number): void {
    const ok = confirm('Are you sure you want to delete this record?');
    if (!ok) return;

    const record = this.records[index];

    this.service.delete(record.medicalfile_id).subscribe({
      next: () => {
        this.records.splice(index, 1);

        if (
          this.selectedRecord &&
          this.selectedRecord.medicalfile_id === record.medicalfile_id
        ) {
          this.selectedRecord = null;
        }

        if (this.isEditing && this.editIndex === index) {
          this.cancelForm();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur delete:', err);
      }
    });
  }
}