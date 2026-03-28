import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MedicalRecordsServiceService } from '../../../../services/medical-records-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-medical-records',
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.css']
})
export class MedicalRecordsComponent implements OnInit {
  activeFilter = 'All';
  filters = ['All', 'Medical Records'];
  showActeForm = false;
  selectedRecordForActe: any = null;
  acteForm = { description: '', typeOfActe: '', date: '' };
  records: any[] = [];
  errorMessage = '';
  selectedRecord: any = null;
  showForm = false;
  isEditing = false;
  editIndex: number | null = null;
  editId: number | null = null;

  selectedFile: File | null = null;       // PDF (local display only for now)
  selectedImageFile: File | null = null;  // Medical image
  imagePreviewUrl: string | null = null;  // base64 preview + sent as JSON field

  formMedicalRecord = new FormGroup({
    medical_historuy: new FormControl('', [Validators.required, Validators.minLength(4)]),
    chronic_diseas:   new FormControl(''),
  });

  constructor(private service: MedicalRecordsServiceService , private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  // ── Records ──────────────────────────────────────────────────────────────

  loadRecords(): void {
    this.service.getMyRecord().subscribe({
      next: (data: any) => {
        this.errorMessage = '';
        // getMyRecord returns a single object containing the medical record
        const dataArray = data ? (Array.isArray(data) ? data : [data]) : [];
        this.records = dataArray.map(r => ({
          ...r,
          icon:        r.icon        ?? '🏥',
          bgColor:     r.bgColor     ?? 'bg-blue-50',
          status:      r.status      ?? 'Active',
          statusClass: r.statusClass ?? 'bg-blue-100 text-blue-700',
          type:        r.type        ?? r.category ?? 'Unknown',
          healthScore: r.healthScore ?? this.computeHealthScore(r),
        }));
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur chargement:', err);
        this.errorMessage = 'Impossible de charger vos dossiers médicaux.';
        this.records = [];
      }
    });
  }

  computeHealthScore(record: any): number {
    let score = 100;
    if (record.chronic_diseas && record.chronic_diseas.trim().length > 0) score -= 20;
    if (record.medical_historuy && record.medical_historuy.length > 50)    score -= 10;
    if (record.result_ia && /abnormal|positive|élevé|risque/i.test(record.result_ia)) score -= 30;
    return Math.max(0, Math.min(100, score));
  }

  getScoreColor(score: number): string {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-600';
  }

  getScoreLabel(score: number): string {
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Fair';
    return 'At Risk';
  }

  get filteredRecords(): any[] {
    if (this.activeFilter === 'All') return this.records;
    return this.records.filter(r => r.type === this.activeFilter);
  }

  viewRecord(record: any): void {
    this.selectedRecord = record;
  }

  openAddForm(): void {
    this.isEditing         = false;
    this.editIndex         = null;
    this.editId            = null;
    this.selectedFile      = null;
    this.selectedImageFile = null;
    this.imagePreviewUrl   = null;
    this.formMedicalRecord.reset();
    this.showForm = true;
  }

  openEditForm(record: any): void {
    this.isEditing         = true;
    this.editIndex         = null;
    this.editId            = record.medicalfile_id;
    this.selectedFile      = null;
    this.selectedImageFile = null;
    this.imagePreviewUrl   = record.imageUrl ?? null;

    this.formMedicalRecord.patchValue({
      medical_historuy: record.medical_historuy,
      chronic_diseas:   record.chronic_diseas,
    });

    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm          = false;
    this.isEditing         = false;
    this.editIndex         = null;
    this.editId            = null;
    this.selectedFile      = null;
    this.selectedImageFile = null;
    this.imagePreviewUrl   = null;
    this.formMedicalRecord.reset();
  }
  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    this.selectedImageFile = file;
    const reader = new FileReader();
    // Store as base64 → will be sent as JSON string field "imageUrl"
    reader.onload = () => { this.imagePreviewUrl = reader.result as string; };
    reader.readAsDataURL(file);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    }
  }

  // ── Save — sends plain JSON ───────────────────────────────────────────────

  saveForm(): void {
    if (this.formMedicalRecord.invalid) return;

    // Build the JSON payload — imageUrl is the base64 string
    const payload: any = { ...this.formMedicalRecord.value };
    if (this.imagePreviewUrl) {
      payload.imageUrl = this.imagePreviewUrl;
    }

    if (this.isEditing && this.editId !== null) {
      this.service.update(this.editId, payload).subscribe({
        next: (updated: any) => {
          const rec = this.buildRecord(updated, payload);
          this.records = this.records.map(r => r.medicalfile_id === this.editId ? rec : r);
          if (this.selectedRecord)     this.selectedRecord = rec;
          this.cancelForm();
        },
        error: (err) => console.error('Erreur update:', err)
      });
    } else {
      this.service.add(payload).subscribe({
        next: (created: any) => {
          this.records = [this.buildRecord(created, payload), ...this.records];
          this.cancelForm();
        },
        error: (err) => console.error('Erreur add:', err)
      });
    }
  }

  private buildRecord(serverData: any, formData: any): any {
    const merged = { ...serverData, ...formData };
    return {
      ...merged,
      imageUrl:    this.imagePreviewUrl ?? serverData.imageUrl ?? null,
      icon:        '🏥',
      bgColor:     'bg-blue-50',
      status:      'Active',
      statusClass: 'bg-blue-100 text-blue-700',
      type:        serverData.type ?? 'Lab Reports',
      healthScore: this.computeHealthScore(merged),
    };
  }
  openAddActeForm(record: any): void {
  this.selectedRecordForActe = record;
  this.acteForm = {
    description: '',
    typeOfActe: '',
    date: new Date().toISOString().slice(0, 16)
  };
  this.showActeForm = true;
}

cancelActeForm(): void {
  this.showActeForm = false;
  this.selectedRecordForActe = null;
  this.acteForm = { description: '', typeOfActe: '', date: '' };
}

saveActe(): void {
  if (!this.selectedRecordForActe) return;
  const medicalFileId = this.selectedRecordForActe.medicalfile_id;
  const payload = {
    description: this.acteForm.description,
    typeOfActe:  this.acteForm.typeOfActe,
    date:        new Date(this.acteForm.date).toISOString()
  };
 this.http.post(`${environment.baseUrl}/medical-records/${medicalFileId}/actes`, payload)
    .subscribe({
      next: () => {
        alert('✅ Acte ajouté avec succès !');
        this.cancelActeForm();
      },
      error: (err) => {
        console.error('Erreur ajout acte:', err);
        alert('❌ Erreur lors de l\'ajout de l\'acte.');
      }
    });
  }
  
@ViewChild('imageFileInput') imageFileInput!: ElementRef<HTMLInputElement>;
@ViewChild('pdfFileInput') pdfFileInput!: ElementRef<HTMLInputElement>;


removeImage(event: MouseEvent): void {
  event.stopPropagation(); // ne pas rouvrir le file picker
  this.selectedImageFile = null;
  this.imagePreviewUrl   = null;
  if (this.imageFileInput) {
    this.imageFileInput.nativeElement.value = '';
  }
}

triggerImageInput(): void {
  this.imageFileInput.nativeElement.click();
}

triggerPdfInput(): void {
  this.pdfFileInput.nativeElement.click();
}

// ── Patient Images / Gallery ────────────────────────────────────────────────
isUploadingPatientImage = false;
patientImagesLoading = false;

onPatientImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    Array.from(input.files).forEach(file => this.uploadPatientImage(file));
  }
  if (input) {
      input.value = ''; // Reset the input to allow selecting the same file again
  }
}


uploadPatientImage(file: File): void {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    alert('Format non supporté. Utilisez: JPG, PNG, GIF, WEBP, PDF');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert('Fichier trop grand. Maximum 10 MB.');
    return;
  }

  this.isUploadingPatientImage = true;
  this.service.uploadPatientImage(file).subscribe({
    next: (data: any) => {
      this.isUploadingPatientImage = false;
      // If we're currently viewing the record, update it immediately
      if (this.selectedRecord && data.medicalfile_id === this.selectedRecord.medicalfile_id) {
        this.selectedRecord.patientImages = data.patientImages;
      }
      alert('Image ajoutée avec succès !');
    },
    error: (err) => {
      this.isUploadingPatientImage = false;
      console.error('Erreur upload image:', err);
      alert('Erreur lors de l\'upload de l\'image.');
    }
  });
}

deletePatientImage(imagePath: string, event: Event): void {
  event.stopPropagation();
  if (!confirm('Voulez-vous vraiment supprimer ce document ?')) return;

  this.service.deletePatientImage(imagePath).subscribe({
    next: () => {
      if (this.selectedRecord && this.selectedRecord.patientImages) {
        this.selectedRecord.patientImages = this.selectedRecord.patientImages.filter((p: string) => p !== imagePath);
      }
      alert('Image supprimée avec succès.');
    },
    error: (err) => {
      console.error('Erreur suppression image:', err);
      alert('Erreur lors de la suppression de l\'image.');
    }
  });
}

isPdf(path: string): boolean {
  return path.toLowerCase().endsWith('.pdf');
}

getFileName(path: string): string {
  return path.split('/').pop() || path;
}

getFileLabel(path: string): string {
  const name = this.getFileName(path);
  return name.length > 30 ? name.substring(0, 27) + '...' : name;
}

getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${environment.baseUrl}${path}`;
}

  deleteRecord(record: any): void {
    if (!confirm('Are you sure you want to delete this record?')) return;

    this.service.delete(record.medicalfile_id).subscribe({
      next: () => {
        this.loadRecords(); // Re-fetch from the database to see the updated list
        if (this.selectedRecord?.medicalfile_id === record.medicalfile_id) this.selectedRecord = null;
        if (this.isEditing && this.editId === record.medicalfile_id) this.cancelForm();
      },
      error: (err: HttpErrorResponse) => console.error('Erreur delete:', err)
    });
  }
}
