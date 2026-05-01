import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MedicalRecordsServiceService } from '../../../../services/medical-records-service.service';
import { PrescriptionService, PrescriptionResponse, MedicineDTO } from '../../../../services/prescription-service.service';
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
  selectedCloudItem: any = null;
  showForm = false;
  isEditing = false;
  editIndex: number | null = null;
  editId: number | null = null;

  // ── New Dashboard Properties ──────────────────────────────────────────────
  viewMode: 'timeline' | 'table' = 'timeline';
  averageHealthScore: number = 0;
  allChronicDiseases: string[] = [];
  unifiedMedicalHistory: string = '';

  // ── Chronic Conditions (from Chronic Disease Module) ─────────────────────
  /** Conditions fetched live from the chronic-disease tracking module */
  chronicConditions: string[] = [];

  // ── Prescription Data ───────────────────────────────────────────────────
  prescriptions: PrescriptionResponse[] = [];
  allMedicines: MedicineDTO[] = [];

  // ── Cloud File Manager Properties ─────────────────────────────────────────
  cloudItems: any[] = [];
  folders: string[] = ['All', 'Prescriptions', 'Lab Results', 'Imaging', 'Consultations'];
  activeFolder: string = 'All';

  selectedFile: File | null = null;
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;

  formMedicalRecord = new FormGroup({
    medical_historuy: new FormControl('', [Validators.required, Validators.minLength(4)]),
    chronic_diseas:   new FormControl(''),
  });

  constructor(
    private service: MedicalRecordsServiceService,
    private prescriptionService: PrescriptionService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadRecords();
    this.loadPrescriptions();
    this.loadChronicConditions();
  }

  // ── Chronic Conditions — read from Chronic Disease module, without modifying it ──

  /** A human-readable label map for condition types coming from the chronic module */
  private readonly CONDITION_LABELS: Record<string, string> = {
    BLOOD_SUGAR:         'Diabetes / Blood Sugar Disorder',
    BLOOD_PRESSURE:      'Hypertension / Blood Pressure Disorder',
    OXYGEN_SATURATION:   'Respiratory / Oxygen Deficiency',
    HEART_RATE:          'Cardiac / Heart Rate Disorder',
  };

  loadChronicConditions(): void {
    const patientId = Number(localStorage.getItem('userId') ?? 0);
    if (!patientId) return;

    this.http.get<any[]>(`http://localhost:8088/api/chronic/patient/${patientId}`).subscribe({
      next: (records) => {
        // Keep only readings flagged as WARNING or CRITICAL (abnormal conditions)
        const abnormal = (records || []).filter(
          (r: any) => r.severity === 'WARNING' || r.severity === 'CRITICAL'
        );
        // Extract unique condition types and map to human-readable labels
        const uniqueTypes = [...new Set(abnormal.map((r: any) => r.conditionType as string))];
        this.chronicConditions = uniqueTypes.map(
          (t) => this.CONDITION_LABELS[t] ?? t
        );
      },
      error: () => {
        // Fail silently — the module may not be available yet
        this.chronicConditions = [];
      }
    });
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
        
        // Sort newest first
        this.records.sort((a, b) => (b.medicalfile_id || 0) - (a.medicalfile_id || 0));
        
        this.calculateMetrics();
        this.buildCloudItems();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Loading error:', err);
        this.errorMessage = 'Unable to load your medical records.';
        this.records = [];
        this.calculateMetrics();
        this.buildCloudItems();
      }
    });
  }

  calculateMetrics(): void {
    if (this.records.length === 0) {
      this.averageHealthScore = 0;
      this.allChronicDiseases = [];
      this.unifiedMedicalHistory = '';
      return;
    }
    
    let totalScore = 0;
    const diseasesSet = new Set<string>();
    let histories: string[] = [];

    this.records.forEach(r => {
      totalScore += (r.healthScore || 100);
      if (r.chronic_diseas) {
        r.chronic_diseas.split(',').forEach((d: string) => {
          const trimmed = d.trim();
          if (trimmed) diseasesSet.add(trimmed);
        });
      }
      if (r.medical_historuy && r.medical_historuy.trim() && !histories.includes(r.medical_historuy.trim())) {
        histories.push(r.medical_historuy.trim());
      }
    });

    this.averageHealthScore = Math.round(totalScore / this.records.length);
    this.allChronicDiseases = Array.from(diseasesSet);
    this.unifiedMedicalHistory = histories.join(' | ');
  }

  loadPrescriptions(): void {
    this.prescriptionService.getMyPrescriptions().subscribe({
      next: (data) => {
        // Sort newest first based on date
        this.prescriptions = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.extractMedicines();
        this.buildCloudItems();
      },
      error: (err) => console.error('Error loading prescriptions:', err)
    });
  }

  extractMedicines(): void {
    const medsMap = new Map<number, MedicineDTO>();
    this.prescriptions.forEach(p => {
      if (p.medicines) {
        p.medicines.forEach(m => {
          if (!medsMap.has(m.medicineId)) {
            medsMap.set(m.medicineId, m);
          }
        });
      }
    });
    this.allMedicines = Array.from(medsMap.values());
  }

  buildCloudItems(): void {
    const items: any[] = [];
    
    // Map Prescriptions
    this.prescriptions.forEach(rx => {
      items.push({
        id: 'rx_' + rx.prescriptionID,
        title: `Prescription of ${new Date(rx.date).toLocaleDateString()}`,
        folder: 'Prescriptions',
        date: rx.date,
        icon: '💊',
        iconBg: '#fef3c7',
        iconColor: '#d97706',
        previewType: 'prescription',
        previewData: rx,
        originalRef: rx
      });
    });

    // Map Records
    this.records.forEach(rec => {
      let folder = 'Consultations';
      const typeStr = (rec.type || rec.category || '').toLowerCase();
      
      if (typeStr.includes('lab') || (rec.imageLabo && rec.imageLabo.toLowerCase().includes('lab'))) {
         folder = 'Lab Results';
      } else if (typeStr.includes('imag') || rec.imageUrl) {
         folder = 'Imaging';
      }

      items.push({
        id: 'rec_' + rec.medicalfile_id,
        title: rec.imageLabo || 'Medical Document',
        folder: folder,
        date: rec.createdAt || new Date().toISOString(), // fallback
        icon: rec.icon || '📄',
        iconBg: '#dbeafe',
        iconColor: '#2563eb',
        previewType: rec.imageUrl ? 'image' : 'text',
        previewData: rec,
        originalRef: rec
      });
    });

    // Sort by date descending
    this.cloudItems = items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  get filteredCloudItems(): any[] {
    if (this.activeFolder === 'All') return this.cloudItems;
    return this.cloudItems.filter(item => item.folder === this.activeFolder);
  }

  computeHealthScore(record: any): number {
    let score = 100;
    if (record.chronic_diseas && record.chronic_diseas.trim().length > 0) score -= 20;
    if (record.medical_historuy && record.medical_historuy.length > 50)    score -= 10;
    if (record.result_ia && /abnormal|positive|high|risk/i.test(record.result_ia)) score -= 30;
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
    // Legacy viewRecord, keep it for acts if needed, but we rely on viewCloudItem now.
  }

  viewCloudItem(item: any): void {
    this.selectedCloudItem = item;
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
          this.records.sort((a, b) => (b.medicalfile_id || 0) - (a.medicalfile_id || 0));
          this.calculateMetrics();
          this.buildCloudItems();
          // Update selected item if we were viewing it
          if (this.selectedCloudItem && this.selectedCloudItem.previewType !== 'prescription' && this.selectedCloudItem.originalRef.medicalfile_id === this.editId) {
             const updatedItem = this.cloudItems.find(i => i.originalRef.medicalfile_id === this.editId);
             if (updatedItem) this.selectedCloudItem = updatedItem;
          }
          this.cancelForm();
        },
        error: (err) => console.error('Update error:', err)
      });
    } else {
      this.service.add(payload).subscribe({
        next: (created: any) => {
          this.records = [this.buildRecord(created, payload), ...this.records];
          this.records.sort((a, b) => (b.medicalfile_id || 0) - (a.medicalfile_id || 0));
          this.calculateMetrics();
          this.buildCloudItems();
          this.cancelForm();
        },
        error: (err) => console.error('Add error:', err)
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
        alert('✅ Procedure added successfully!');
        this.cancelActeForm();
      },
      error: (err) => {
        console.error('Error adding procedure:', err);
        alert('❌ Error adding the procedure.');
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
    alert('Unsupported format. Use: JPG, PNG, GIF, WEBP, PDF');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert('File too large. Maximum 10 MB.');
    return;
  }

  this.isUploadingPatientImage = true;
  this.service.uploadPatientImage(file).subscribe({
    next: (data: any) => {
      this.isUploadingPatientImage = false;
      // If we're currently viewing the record, update it immediately
      if (this.selectedCloudItem && this.selectedCloudItem.previewType !== 'prescription' && data.medicalfile_id === this.selectedCloudItem.originalRef.medicalfile_id) {
        this.selectedCloudItem.originalRef.patientImages = data.patientImages;
      }
      alert('Image added successfully!');
    },
    error: (err) => {
      this.isUploadingPatientImage = false;
      console.error('Image upload error:', err);
      alert('Error uploading the image.');
    }
  });
}

deletePatientImage(imagePath: string, event: Event): void {
  event.stopPropagation();
  if (!confirm('Are you sure you want to delete this document?')) return;

  this.service.deletePatientImage(imagePath).subscribe({
    next: () => {
      if (this.selectedCloudItem && this.selectedCloudItem.previewType !== 'prescription' && this.selectedCloudItem.originalRef.patientImages) {
        this.selectedCloudItem.originalRef.patientImages = this.selectedCloudItem.originalRef.patientImages.filter((p: string) => p !== imagePath);
      }
      alert('Document deleted successfully.');
    },
    error: (err) => {
      console.error('Document deletion error:', err);
      alert('Error deleting the document.');
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
        if (this.selectedCloudItem && this.selectedCloudItem.previewType !== 'prescription' && this.selectedCloudItem.originalRef.medicalfile_id === record.medicalfile_id) {
          this.selectedCloudItem = null;
        }
        if (this.isEditing && this.editId === record.medicalfile_id) this.cancelForm();
      },
      error: (err: HttpErrorResponse) => console.error('Deletion error:', err)
    });
  }
}
