// No changes needed to TypeScript - all existing functionality preserved
import { Component, OnInit } from '@angular/core';
import { MedicalPictureAnalysisResponse, MedicalPictureAnalysisRequest } from '../../models/medical-picture-analysis.model';
import { MedicalPictureAnalysisService } from '../../services/medical-picture-analysis.service';

type StatusFilter = 'All' | 'Pending' | 'In Progress' | 'Completed' | 'Validated';

@Component({
  selector: 'app-medical-picture-list',
  templateUrl: './medical-picture-list.component.html',
  styleUrls: ['./medical-picture-list.component.css']
})
export class MedicalPictureListComponent implements OnInit {
  analyses: MedicalPictureAnalysisResponse[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  activeFilter: StatusFilter = 'All';
  viewMode: 'table' | 'cards' = 'cards'; // Vue par défaut en cartes

  showForm = false;
  isEditMode = false;
  isSaving = false;
  editingId: number | null = null;

  selectedFile: File | null = null;

  private readonly IMAGE_BASE_URL = 'http://localhost:8088/uploads/medical-pictures/';

  categoryOptions = ['Radio', 'Scanner', 'IRM', 'Echographie'];
  statusOptions = ['Pending', 'In Progress', 'Completed', 'Validated', 'Rejected'];
  filterOptions: StatusFilter[] = ['All', 'Pending', 'In Progress', 'Completed', 'Validated'];

  formData = {
    history: '',
    laboratoryResultId: null as number | null,
    imageName: '',
    imageType: '',
    imagePath: '',
    category: '',
    analysisResult: '',
    confidenceScore: null as number | null,
    status: 'Pending',
    doctorNote: '',
    uploadDate: '',
    validationDate: ''
  };

  constructor(private service: MedicalPictureAnalysisService) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.isLoading = true;
    this.service.getAll().subscribe({
      next: (data: MedicalPictureAnalysisResponse[]) => {
        this.analyses = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur de chargement des analyses.';
        this.isLoading = false;
      }
    });
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter = filter;
  }

  get filteredAnalyses(): MedicalPictureAnalysisResponse[] {
    let filtered = this.analyses;
    if (this.activeFilter !== 'All') {
      filtered = filtered.filter(a => a.status?.toLowerCase() === this.activeFilter.toLowerCase());
    }
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      filtered = filtered.filter((a: MedicalPictureAnalysisResponse) =>
        a.testName?.toLowerCase().includes(t) ||
        a.nameLabo?.toLowerCase().includes(t) ||
        a.history?.toLowerCase().includes(t) ||
        a.category?.toLowerCase().includes(t) ||
        a.status?.toLowerCase().includes(t) ||
        a.analysisResult?.toLowerCase().includes(t)
      );
    }
    return filtered;
  }

  getImageUrl(imageName: string): string {
    return `${this.IMAGE_BASE_URL}${imageName}`;
  }

  openImage(imageName: string): void {
    window.open(this.getImageUrl(imageName), '_blank');
  }

  openCreateForm(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
    document.body.style.overflow = 'hidden';
  }

  openEditForm(a: MedicalPictureAnalysisResponse): void {
    this.isEditMode = true;
    this.editingId = a.picId;
    this.selectedFile = null;
    this.formData = {
      history: a.history,
      laboratoryResultId: a.laboratoryResultId,
      imageName: a.imageName,
      imageType: a.imageType,
      imagePath: a.imagePath,
      category: a.category,
      analysisResult: a.analysisResult,
      confidenceScore: a.confidenceScore,
      status: a.status,
      doctorNote: a.doctorNote,
      uploadDate: a.uploadDate,
      validationDate: a.validationDate
    };
    this.showForm = true;
    document.body.style.overflow = 'hidden';
  }

  closeForm(): void { 
    this.showForm = false; 
    this.resetForm(); 
    document.body.style.overflow = 'auto';
  }

  resetForm(): void {
    this.selectedFile = null;
    this.formData = {
      history: '', laboratoryResultId: null,
      imageName: '', imageType: '', imagePath: '', category: '',
      analysisResult: '', confidenceScore: null,
      status: 'Pending', doctorNote: '',
      uploadDate: '', validationDate: ''
    };
    this.errorMessage = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.formData.imageName = this.selectedFile.name;
      this.formData.imageType = this.selectedFile.type;
    }
  }

  onSubmit(): void {
    if (!this.formData.history || !this.formData.laboratoryResultId) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    this.isSaving = true;
    this.errorMessage = '';
    const payload: MedicalPictureAnalysisRequest = {
      history: this.formData.history,
      laboratoryResultId: this.formData.laboratoryResultId!,
      imageName: this.formData.imageName,
      imageType: this.formData.imageType,
      imagePath: this.formData.imagePath,
      category: this.formData.category,
      analysisResult: this.formData.analysisResult,
      confidenceScore: this.formData.confidenceScore ?? undefined,
      status: this.formData.status,
      doctorNote: this.formData.doctorNote,
      uploadDate: this.formData.uploadDate,
      validationDate: this.formData.validationDate
    };
    let req$;
    if (!this.isEditMode && this.selectedFile) {
      req$ = this.service.createWithImage(payload, this.selectedFile);
    } else if (this.isEditMode && this.editingId) {
      req$ = this.service.update(this.editingId, payload);
    } else {
      req$ = this.service.create(payload);
    }
    req$.subscribe({
      next: () => {
        this.successMessage = this.isEditMode ? 'Analyse mise à jour avec succès.' : 'Analyse créée avec succès.';
        this.isSaving = false;
        this.showForm = false;
        document.body.style.overflow = 'auto';
        this.loadAll();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la sauvegarde. Veuillez réessayer.';
        this.isSaving = false;
      }
    });
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?')) {
      this.service.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Analyse supprimée avec succès.';
          this.loadAll();
          setTimeout(() => this.successMessage = '', 4000);
        },
        error: () => { this.errorMessage = 'Erreur lors de la suppression.'; }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'validated': return 'status-validated';
      case 'completed': return 'status-completed';
      case 'in progress': return 'status-progress';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-default';
    }
  }

  getConfidencePercent(score: number): string {
    if (!score && score !== 0) return '-';
    return (score * 100).toFixed(0) + '%';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}