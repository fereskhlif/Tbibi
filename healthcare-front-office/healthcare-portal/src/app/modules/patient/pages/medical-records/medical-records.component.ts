import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-medical-records',
  templateUrl: './medical-records.component.html'
})
export class MedicalRecordsComponent {
  activeFilter = 'All';
  filters = ['All', 'Lab Reports', 'Prescriptions', 'Imaging', 'Consultations'];

  records: any[] = [];
  selectedRecord: any = null;
  showForm = false;
  isEditing = false;
  editIndex: number | null = null;
  selectedFile: File | null = null;

  formMedicalRecord = new FormGroup({
    imageLabo: new FormControl('', Validators.required),
    result_ia: new FormControl('', Validators.required),
    medical_historuy: new FormControl('', [Validators.required, Validators.minLength(4)]),
    chronic_diseas: new FormControl('', ),
  });

  get filteredRecords() {
    if (this.activeFilter === 'All') return this.records;
    return this.records.filter(r => r.type === this.activeFilter);
  }

  viewRecord(record: any) {
    this.selectedRecord = record;
  }

  openAddForm() {
    this.isEditing = false;
    this.editIndex = null;
    this.selectedFile = null;
    this.formMedicalRecord.reset();
    this.showForm = true;
  }

  openEditForm(record: any, index: number) {
    this.isEditing = true;
    this.editIndex = index;
    this.selectedFile = null;
    this.formMedicalRecord.patchValue({
      imageLabo: record.imageLabo,
      result_ia: record.result_ia,
      medical_historuy: record.medical_historuy,
      chronic_diseas: record.chronic_diseas,
    });
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.isEditing = false;
    this.editIndex = null;
    this.selectedFile = null;
    this.formMedicalRecord.reset();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    }
  }

  saveForm() {
    if (this.formMedicalRecord.invalid) return;

    const formData = new FormData();
    formData.append('data', JSON.stringify(this.formMedicalRecord.value));
    if (this.selectedFile) {
      formData.append('rep_doc', this.selectedFile);
    }

    const newRec = {
      ...this.formMedicalRecord.value,
      rep_doc: this.selectedFile ? this.selectedFile.name : (this.isEditing && this.editIndex !== null ? this.records[this.editIndex].rep_doc : ''),
      icon: '🏥',
      bgColor: 'bg-blue-50',
      status: 'Active',
      statusClass: 'bg-blue-100 text-blue-700',
      type: 'Lab Reports'
    };

    if (this.isEditing && this.editIndex !== null) {
      this.records[this.editIndex] = newRec;
      if (this.selectedRecord) this.selectedRecord = newRec;
    } else {
      this.records.unshift(newRec);
    }

    console.log('FormData envoyé au backend:', this.formMedicalRecord.value);
    this.cancelForm();
  }

  deleteRecord(index: number) {
    const ok = confirm('Are you sure you want to delete this record?');
    if (!ok) return;
    const removed = this.records.splice(index, 1);
    if (this.selectedRecord && removed.length && this.selectedRecord === removed[0]) {
      this.selectedRecord = null;
    }
    if (this.isEditing && this.editIndex === index) {
      this.cancelForm();
    }
  }
}
