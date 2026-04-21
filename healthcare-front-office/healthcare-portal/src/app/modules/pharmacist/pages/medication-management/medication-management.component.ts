import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { WebcamImage } from 'ngx-webcam';
import { OcrService } from '../../../../services/ocr.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PharmacistMedicineService } from '../../services/pharmacist-medicine.service';
import { Medicine, MedicineUpdateRequest } from '../../models/medicine.model';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';

type FilterTab = 'all' | 'lowstock' | 'expired';
type ModalType = 'add' | 'edit' | 'images' | 'restock' | 'delete' | 'duplicate' | null; // ← ADDED 'duplicate'

@Component({
  selector: 'app-medication-management',
  templateUrl: './medication-management.component.html'
})
export class MedicationManagementComponent implements OnInit {
  // State
  medicines: Medicine[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  activeTab: FilterTab = 'all';

  // Sorting
  sortBy: 'medicineName' | 'stock' | 'dateOfExpiration' | 'price' = 'medicineName';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Validation
  minDate = '';

  // Bulk selection
  selectedMedicineIds: Set<string> = new Set();

  // Modal state
  activeModal: ModalType = null;
  selectedMedicine: Medicine | null = null;

  // forms
  medicineForm!: FormGroup;
  restockForm!: FormGroup;

  // Inline form errors
  formError = '';
  restockError = '';

  // OCR properties
  isScanning = false;
  showWebcam = false;
  scanError = '';
  scannedSuccessfully = false;
  trigger: Subject<void> = new Subject<void>();
  scannedForm = '';
  scannedActiveIngredient = '';

  // Input mode: 'scan' or 'manual'
  inputMode: 'scan' | 'manual' = 'scan';

  // Duplicate detection
  duplicateData: any = null;
  existingDuplicate: Medicine | null = null;

  // Image management
  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('addImagesInput', { static: false }) addImagesInput?: ElementRef<HTMLInputElement>;
  @ViewChild('imagePicker', { static: false }) imagePicker?: any;
  @ViewChild('addPicker', { static: false }) addPicker?: any;
  selectedFiles: File[] = [];
  filePreviews: string[] = [];
  addImageFiles: File[] = [];
  addImagePreviews: string[] = [];

  // Submitting state
  submitting = false;
  imageDeleting: string | null = null;

  constructor(
    private medicineService: PharmacistMedicineService,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private ocrService: OcrService
  ) { }

  protected readonly Math = Math;

  ngOnInit(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.buildForms();
    this.loadMedicines();
  }

  // ─── Forms ────────────────────────────────────────────────────────────────

  private buildForms(): void {
    this.medicineForm = this.fb.group({
      medicineName: [''],
      description: [''],
      dosage: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      minStockAlert: [10, [Validators.required, Validators.min(0)]],
      dateOfExpiration: ['', Validators.required],
      form: [''],
      activeIngredient: ['']
    });

    this.restockForm = this.fb.group({
      stock: [null, [Validators.required, Validators.min(0)]]
    });
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────

  loadMedicines(): void {
    this.loading = true;
    this.error = '';
    this.medicineService.getAll().subscribe({
      next: (data) => {
        this.medicines = data;
        this.loading = false;
      },
      error: (err) => {
        const status = err?.status;
        this.error = status === 0
          ? 'Cannot reach the server. Make sure the backend is running on port 8088.'
          : `Failed to load medications (HTTP ${status}).`;
        this.loading = false;
        console.error('Error loading medications:', err);
      }
    });
  }

  // ─── Filtering & Search ───────────────────────────────────────────────────

  get filteredMedicines(): Medicine[] {
    let list = [...this.medicines];

    if (this.activeTab === 'lowstock') {
      list = list.filter(m => m.stock < m.minStockAlert);
    } else if (this.activeTab === 'expired') {
      list = list.filter(m => this.isExpired(m));
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(m => m.medicineName.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      let valA: any = a[this.sortBy];
      let valB: any = b[this.sortBy];

      if (this.sortBy === 'dateOfExpiration') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      const comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }

  get paginatedMedicines(): Medicine[] {
    const list = this.filteredMedicines;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return list.slice(startIndex, startIndex + this.pageSize);
  }

  get totalFiltered(): number { return this.filteredMedicines.length; }
  get totalPages(): number { return Math.ceil(this.totalFiltered / this.pageSize); }
  get allCount(): number { return this.medicines.length; }
  get lowStockCount(): number { return this.medicines.filter(m => m.stock < m.minStockAlert).length; }
  get expiredCount(): number { return this.medicines.filter(m => this.isExpired(m)).length; }

  getPagesArray(): number[] {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // ─── OCR Methods ──────────────────────────────────────────────────────────

  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  openWebcam(): void {
    this.showWebcam = true;
    this.scanError = '';
  }

  closeWebcam(): void {
    this.showWebcam = false;
  }

  capture(): void {
    this.trigger.next();
  }

  handleImage(webcamImage: WebcamImage): void {
    this.showWebcam = false;
    this.isScanning = true;
    this.scanError = '';

    const base64 = webcamImage.imageAsBase64;
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/jpeg' });
    const file = new File([blob], 'medicine.jpg', { type: 'image/jpeg' });

    this.ocrService.scanMedicine(file).subscribe({
      next: (result) => {
        this.isScanning = false;
        this.scannedSuccessfully = true;
        // Enable fields before patching so values are accepted
        this.medicineForm.get('medicineName')?.enable();
        this.medicineForm.get('dosage')?.enable();
        this.medicineForm.get('form')?.enable();
        this.medicineForm.get('activeIngredient')?.enable();
        this.medicineForm.patchValue({
          medicineName: result.medicineName || '',
          dosage: result.dosage || '',
          description: result.description || '',
          form: result.form || '',
          activeIngredient: result.activeIngredient || ''
        });
        // Keep fields enabled so pharmacist can correct the scan result
        this.scannedForm = result.form || '';
        this.scannedActiveIngredient = result.activeIngredient || '';
      },
      error: () => {
        this.isScanning = false;
        this.scanError = 'Scan failed. Please try again or fill manually.';
      }
    });
  }

  // ─── Badge Helpers ────────────────────────────────────────────────────────

  isExpired(med: Medicine): boolean {
    return new Date(med.dateOfExpiration) < new Date();
  }

  isExpiringSoon(med: Medicine): boolean {
    if (this.isExpired(med)) return false;
    const days30 = new Date();
    days30.setDate(days30.getDate() + 30);
    return new Date(med.dateOfExpiration) <= days30;
  }

  isLowStock(med: Medicine): boolean {
    return med.stock < med.minStockAlert;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  // ─── Interaction Handlers ──────────────────────────────────────────────────

  clearSearch(): void { this.searchQuery = ''; this.currentPage = 1; }
  onSearchChange(): void { this.currentPage = 1; }
  onTabChange(tab: FilterTab): void { this.activeTab = tab; this.currentPage = 1; }

  setSort(field: 'medicineName' | 'stock' | 'dateOfExpiration'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.currentPage = 1;
  }

  onPageNext(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  onPagePrev(): void { if (this.currentPage > 1) this.currentPage--; }

  toggleSelect(id: number): void {
    if (this.selectedMedicineIds.has(id.toString())) {
      this.selectedMedicineIds.delete(id.toString());
    } else {
      this.selectedMedicineIds.add(id.toString());
    }
  }

  isSelected(id: number): boolean { return this.selectedMedicineIds.has(id.toString()); }

  toggleSelectAll(): void {
    const currentIds = this.paginatedMedicines.map(m => m.medicineId!.toString());
    const allSelected = currentIds.every(id => this.selectedMedicineIds.has(id));
    if (allSelected) {
      currentIds.forEach(id => this.selectedMedicineIds.delete(id));
    } else {
      currentIds.forEach(id => this.selectedMedicineIds.add(id));
    }
  }

  isAllSelected(): boolean {
    if (this.paginatedMedicines.length === 0) return false;
    return this.paginatedMedicines.every(m => this.selectedMedicineIds.has(m.medicineId!.toString()));
  }

  confirmBulkDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedMedicineIds.size} medications?`)) {
      this.selectedMedicineIds.forEach(idStr => {
        const id = parseInt(idStr, 10);
        this.medicineService.delete(id).subscribe(() => {
          this.medicines = this.medicines.filter(m => m.medicineId !== id);
          this.selectedMedicineIds.delete(idStr);
        });
      });
    }
  }

  // ─── Modal Open/Close ─────────────────────────────────────────────────────

  openAddModal(): void {
    this.activeModal = 'add';
    this.selectedMedicine = null;
    this.selectedFiles = [];
    this.filePreviews = [];
    this.formError = '';
    this.showWebcam = false;
    this.isScanning = false;
    this.scanError = '';
    this.scannedSuccessfully = false;
    this.duplicateData = null;
    this.existingDuplicate = null;
    this.inputMode = 'scan';

    // Always enable all fields
    this.medicineForm.get('medicineName')?.enable();
    this.medicineForm.get('dosage')?.enable();
    this.medicineForm.get('form')?.enable();
    this.medicineForm.get('activeIngredient')?.enable();
    this.medicineForm.reset({
      medicineName: '', description: '', dosage: '',
      price: null, stock: null, minStockAlert: 10, dateOfExpiration: '',
      form: '', activeIngredient: ''
    });
    this.medicineForm.markAsUntouched();
    this.medicineForm.markAsPristine();

    // In scan mode, disable name/dosage/form/activeIngredient until scan
    this.lockScanFields();

    setTimeout(() => {
      const modal = document.querySelector('.overflow-y-auto');
      if (modal) modal.scrollTop = 0;
    }, 50);
  }

  switchInputMode(mode: 'scan' | 'manual'): void {
    this.inputMode = mode;
    this.showWebcam = false;
    this.isScanning = false;
    this.scanError = '';
    this.scannedSuccessfully = false;

    if (mode === 'manual') {
      // Enable all fields for manual entry
      this.medicineForm.get('medicineName')?.enable();
      this.medicineForm.get('dosage')?.enable();
      this.medicineForm.get('form')?.enable();
      this.medicineForm.get('activeIngredient')?.enable();
      this.medicineForm.reset({
        medicineName: '', description: '', dosage: '',
        price: null, stock: null, minStockAlert: 10, dateOfExpiration: '',
        form: '', activeIngredient: ''
      });
      this.medicineForm.markAsUntouched();
    } else {
      // Back to scan mode: lock fields until scan
      this.medicineForm.get('medicineName')?.enable();
      this.medicineForm.get('dosage')?.enable();
      this.medicineForm.get('form')?.enable();
      this.medicineForm.get('activeIngredient')?.enable();
      this.medicineForm.reset({
        medicineName: '', description: '', dosage: '',
        price: null, stock: null, minStockAlert: 10, dateOfExpiration: '',
        form: '', activeIngredient: ''
      });
      this.medicineForm.markAsUntouched();
      this.lockScanFields();
    }
  }

  private lockScanFields(): void {
    this.medicineForm.get('medicineName')?.disable();
    this.medicineForm.get('dosage')?.disable();
    this.medicineForm.get('form')?.disable();
    this.medicineForm.get('activeIngredient')?.disable();
  }

  openEditModal(med: Medicine): void {
    this.activeModal = 'edit';
    this.selectedMedicine = med;
    this.formError = '';
    const expDate = med.dateOfExpiration
      ? new Date(med.dateOfExpiration).toISOString().split('T')[0]
      : '';
    this.medicineForm.get('medicineName')?.disable();
    this.medicineForm.get('dosage')?.disable();
    this.medicineForm.get('form')?.disable();
    this.medicineForm.get('activeIngredient')?.disable();
    this.medicineForm.patchValue({
      medicineName: med.medicineName,
      description: med.description || '',
      dosage: med.dosage || '',
      price: med.price,
      stock: med.stock,
      minStockAlert: med.minStockAlert,
      dateOfExpiration: expDate,
      form: med.form || '',
      activeIngredient: med.activeIngredient || ''
    });
    this.medicineForm.markAsUntouched();
    this.medicineForm.markAsPristine();
  }

  openRestockModal(med: Medicine): void {
    this.activeModal = 'restock';
    this.selectedMedicine = med;
    this.restockError = '';
    this.restockForm.patchValue({ stock: med.stock });
    this.restockForm.markAsUntouched();
  }

  openImageModal(med: Medicine): void {
    this.activeModal = 'images';
    this.selectedMedicine = med;
    this.addImageFiles = [];
  }

  closeModal(): void {
    this.activeModal = null;
    this.selectedMedicine = null;
    this.selectedFiles = [];
    this.filePreviews = [];
    this.addImageFiles = [];
    this.addImagePreviews = [];
    this.submitting = false;
    this.formError = '';
    this.restockError = '';
    this.showWebcam = false;
    this.isScanning = false;
    this.scanError = '';
    this.duplicateData = null;
    this.existingDuplicate = null;
  }

  // ─── File Selection ───────────────────────────────────────────────────────

  onFilesChanged(files: FileList | null): void {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => this.filePreviews.push(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    if (this.addPicker?.nativeFileElement) {
      this.addPicker.nativeFileElement.value = '';
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.filePreviews.splice(index, 1);
  }

  onAddImagesChanged(files: FileList | null): void {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    this.addImageFiles = [...this.addImageFiles, ...newFiles];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => this.addImagePreviews.push(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    if (this.imagePicker?.nativeFileElement) {
      this.imagePicker.nativeFileElement.value = '';
    }
  }

  removeAddImageFile(index: number): void {
    this.addImageFiles.splice(index, 1);
    this.addImagePreviews.splice(index, 1);
  }

  // ─── CRUD Operations ──────────────────────────────────────────────────────

  submitMedicine(): void {
    this.formError = '';
    this.medicineForm.markAllAsTouched();

    // Check only enabled fields for validity
    const enabledControls = Object.keys(this.medicineForm.controls)
      .filter(key => !this.medicineForm.get(key)?.disabled);
    const hasError = enabledControls.some(key => this.medicineForm.get(key)?.invalid);

    if (hasError) {
      this.formError = 'Please fill in all required fields correctly.';
      return;
    }

    if (this.activeModal === 'add' && this.selectedFiles.length === 0) {
      this.formError = 'Please select at least one image for the new medicine.';
      return;
    }

    const raw = this.medicineForm.getRawValue();

    // ─── Duplicate Check ────────────────────────────────────────────────────
    if (this.activeModal === 'add' && raw.medicineName) {
      console.log('Checking for duplicate...');
      const name = (raw.medicineName || '').trim().toLowerCase();

      const duplicate = this.medicines.find(m => {
        const mName = (m.medicineName || '').trim().toLowerCase();
        return mName === name;
      });

      if (duplicate) {
        this.duplicateData = raw;
        this.existingDuplicate = duplicate;
        this.submitting = false;
        this.activeModal = 'duplicate';
        return;
      }
    }

    // No duplicate or edit mode, proceed to save
    this.doSaveMedicine(raw);
  }

  doSaveMedicine(raw: any): void {
    this.submitting = true;

    const payload: MedicineUpdateRequest = {
      medicineName: raw.medicineName,
      description: raw.description || '',
      dosage: raw.dosage || '',
      price: Number(raw.price),
      stock: Number(raw.stock),
      minStockAlert: Number(raw.minStockAlert),
      dateOfExpiration: new Date(raw.dateOfExpiration).toISOString(),
      activeIngredient: raw.activeIngredient || '',
      form: raw.form || '',
      pharmacyId: 1 // Link to pharmacy to prevent 500 error
    };

    if (this.activeModal === 'add' || this.activeModal === 'duplicate') {
      this.medicineService.create(payload, this.selectedFiles).subscribe({
        next: () => {
          this.closeModal();
          this.loadMedicines();
          MainLayoutComponent.showToast('Medicine added successfully!', 'success');
        },
        error: (err) => {
          this.submitting = false;
          const msg = err?.error?.message || err?.message || 'Unknown error';
          this.formError = `Failed to add medicine: ${msg}`;
          console.error('Add medicine error:', err);
        }
      });
    } else if (this.activeModal === 'edit' && this.selectedMedicine) {
      this.medicineService.update(this.selectedMedicine.medicineId, payload).subscribe({
        next: () => {
          this.closeModal();
          this.loadMedicines();
          MainLayoutComponent.showToast('Medicine updated successfully!', 'success');
        },
        error: (err) => {
          this.submitting = false;
          const msg = err?.error?.message || err?.message || 'Unknown error';
          this.formError = `Failed to update medicine: ${msg}`;
          console.error('Update medicine error:', err);
        }
      });
    }
  }

  updateExistingStock(): void {
    if (!this.duplicateData || !this.existingDuplicate) return;

    this.submitting = true;
    const existing = this.existingDuplicate;
    const newStock = existing.stock + Number(this.duplicateData.stock);

    const payload: MedicineUpdateRequest = {
      medicineName: existing.medicineName,
      description: existing.description || '',
      dosage: existing.dosage || '',
      price: existing.price,
      stock: newStock,
      minStockAlert: existing.minStockAlert,
      dateOfExpiration: existing.dateOfExpiration,
      form: existing.form || '',
      activeIngredient: existing.activeIngredient || '',
      pharmacyId: 1
    };

    this.medicineService.update(existing.medicineId, payload).subscribe({
      next: () => {
        this.closeModal();
        this.loadMedicines();
        MainLayoutComponent.showToast(
          `Stock updated! ${existing.medicineName} now has ${newStock} units.`,
          'success'
        );
      },
      error: () => {
        this.submitting = false;
        MainLayoutComponent.showToast('Failed to update stock.', 'error');
      }
    });
  }

  submitRestock(): void {
    this.restockError = '';
    this.restockForm.markAllAsTouched();
    if (this.restockForm.invalid || !this.selectedMedicine) {
      this.restockError = 'Please enter a valid stock quantity (≥ 0).';
      return;
    }
    this.submitting = true;
    const med = this.selectedMedicine;
    const newStock = Number(this.restockForm.value.stock);

    const payload: MedicineUpdateRequest = {
      medicineName: med.medicineName,
      description: med.description || '',
      dosage: med.dosage || '',
      price: med.price,
      stock: newStock,
      minStockAlert: med.minStockAlert,
      dateOfExpiration: med.dateOfExpiration,
      activeIngredient: med.activeIngredient || '',
      form: med.form || '',
      pharmacyId: 1
    };

    this.medicineService.update(med.medicineId, payload).subscribe({
      next: () => {
        const idx = this.medicines.findIndex(m => m.medicineId === med.medicineId);
        if (idx !== -1) this.medicines[idx].stock = newStock;
        this.closeModal();
        MainLayoutComponent.showToast('Stock updated successfully!', 'success');
      },
      error: (err) => {
        this.submitting = false;
        const msg = err?.error?.message || err?.message || 'Unknown error';
        this.restockError = `Failed to update stock: ${msg}`;
        console.error('Restock error:', err);
      }
    });
  }

  deleteMedicine(med: Medicine): void {
    this.activeModal = 'delete';
    this.selectedMedicine = med;
  }

  confirmDelete(): void {
    if (!this.selectedMedicine) return;
    this.submitting = true;
    this.medicineService.delete(this.selectedMedicine.medicineId).subscribe({
      next: () => {
        this.medicines = this.medicines.filter(m => m.medicineId !== this.selectedMedicine?.medicineId);
        this.closeModal();
        MainLayoutComponent.showToast('Medicine removed from catalog.', 'success');
      },
      error: (err) => {
        this.submitting = false;
        MainLayoutComponent.showToast('Failed to delete medicine.', 'error');
        console.error(err);
      }
    });
  }

  // ─── Image Management ─────────────────────────────────────────────────────

  deleteImage(imageUrl: string): void {
    if (!this.selectedMedicine) return;
    this.imageDeleting = imageUrl;
    this.medicineService.deleteImage(this.selectedMedicine.medicineId, imageUrl).subscribe({
      next: () => {
        if (this.selectedMedicine) {
          this.selectedMedicine.imageUrls = this.selectedMedicine.imageUrls.filter(u => u !== imageUrl);
        }
        this.imageDeleting = null;
        MainLayoutComponent.showToast('Image removed.', 'success');
      },
      error: (err) => {
        this.imageDeleting = null;
        MainLayoutComponent.showToast('Failed to remove image.', 'error');
        console.error(err);
      }
    });
  }

  uploadImages(): void {
    if (!this.selectedMedicine || this.addImageFiles.length === 0) return;
    this.submitting = true;
    this.medicineService.addImages(this.selectedMedicine.medicineId, this.addImageFiles).subscribe({
      next: (updated) => {
        if (this.selectedMedicine) {
          this.selectedMedicine.imageUrls = updated.imageUrls;
        }
        this.addImageFiles = [];
        this.addImagePreviews = [];
        this.submitting = false;
        if (this.imagePicker?.nativeFileElement) {
          this.imagePicker.nativeFileElement.value = '';
        }
        MainLayoutComponent.showToast('Images uploaded successfully!', 'success');
      },
      error: (err) => {
        this.submitting = false;
        if (this.imagePicker?.nativeFileElement) {
          this.imagePicker.nativeFileElement.value = '';
        }
        MainLayoutComponent.showToast('Failed to upload images.', 'error');
        console.error(err);
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getFirstImage(med: Medicine): string | null {
    return med.imageUrls && med.imageUrls.length > 0 ? med.imageUrls[0] : null;
  }

  hasError(field: string): boolean {
    const ctrl = this.medicineForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  trackByMed(_: number, med: Medicine): number {
    return med.medicineId;
  }
}
