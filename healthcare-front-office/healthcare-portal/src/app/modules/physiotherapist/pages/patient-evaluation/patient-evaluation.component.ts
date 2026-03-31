import { Component, OnInit } from '@angular/core';
import { PatientEvaluationService } from '../../services/patient-evaluation.service';
import { PatientEvaluation, PatientEvaluationRequest } from '../../models/patient-evaluation.model';
import { HttpClient } from '@angular/common/http';

interface Patient {
  userId: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-patient-evaluation',
  templateUrl: './patient-evaluation.component.html',
  styleUrls: ['./patient-evaluation.component.css']
})
export class PatientEvaluationComponent implements OnInit {
  evaluations: PatientEvaluation[] = [];
  filteredEvaluations: PatientEvaluation[] = [];
  patients: Patient[] = [];
  currentPhysioId: number = 0; // Will be set from localStorage
  
  searchTerm: string = '';
  
  showCreateModal: boolean = false;
  showDetailModal: boolean = false;
  selectedEvaluation: PatientEvaluation | null = null;
  
  newEvaluation: PatientEvaluationRequest = this.getEmptyEvaluation();

  private apiUrl = 'http://localhost:8088/api';

  constructor(
    private evaluationService: PatientEvaluationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Get the logged-in physiotherapist's ID from localStorage
    this.currentPhysioId = Number(localStorage.getItem('userId') || '0');
    if (this.currentPhysioId === 0) {
      console.error('No user ID found in localStorage');
      return;
    }
    this.loadEvaluations();
    this.loadPatients();
  }

  loadEvaluations(): void {
    this.evaluationService.getByPhysiotherapist(this.currentPhysioId)
      .subscribe({
        next: (data) => {
          this.evaluations = data;
          this.applyFilters();
        },
        error: (err) => console.error('Error loading evaluations:', err)
      });
  }

  loadPatients(): void {
    this.http.get<Patient[]>(`${this.apiUrl}/users/patients`)
      .subscribe({
        next: (data) => {
          this.patients = data;
        },
        error: (err) => console.error('Error loading patients:', err)
      });
  }

  applyFilters(): void {
    this.filteredEvaluations = this.evaluations.filter(evaluation => {
      const matchesSearch = !this.searchTerm || 
        evaluation.patientName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        evaluation.jointLocation?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  openCreateModal(): void {
    this.newEvaluation = this.getEmptyEvaluation();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openDetailModal(evaluation: PatientEvaluation): void {
    this.selectedEvaluation = evaluation;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedEvaluation = null;
  }

  createEvaluation(): void {
    if (!this.validateEvaluation(this.newEvaluation)) return;
    
    this.evaluationService.create(this.newEvaluation).subscribe({
      next: () => {
        this.loadEvaluations();
        this.closeCreateModal();
        alert('Évaluation créée avec succès!');
      },
      error: (err) => {
        console.error('Error creating evaluation:', err);
        alert('Erreur lors de la création de l\'évaluation');
      }
    });
  }

  deleteEvaluation(evaluationId: number): void {
    if (!confirm('Voulez-vous vraiment supprimer cette évaluation?')) return;
    
    this.evaluationService.delete(evaluationId).subscribe({
      next: () => {
        this.loadEvaluations();
        alert('Évaluation supprimée avec succès!');
      },
      error: (err) => {
        console.error('Error deleting evaluation:', err);
        alert('Erreur lors de la suppression de l\'évaluation');
      }
    });
  }

  validateEvaluation(evaluation: PatientEvaluationRequest): boolean {
    if (!evaluation.patientId || !evaluation.evaluationDate || 
        evaluation.painScale === null || evaluation.painScale === undefined ||
        !evaluation.painDescription || !evaluation.jointLocation ||
        !evaluation.functionalLimitations) {
      alert('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (evaluation.painScale < 0 || evaluation.painScale > 10) {
      alert('L\'échelle de douleur doit être entre 0 et 10');
      return false;
    }
    return true;
  }

  getEmptyEvaluation(): PatientEvaluationRequest {
    return {
      patientId: 0,
      physiotherapistId: this.currentPhysioId,
      evaluationDate: new Date().toISOString().split('T')[0],
      painScale: 0,
      painDescription: '',
      flexionDegrees: 0,
      extensionDegrees: 0,
      jointLocation: '',
      functionalLimitations: '',
      generalObservations: '',
      treatmentGoals: ''
    };
  }

  getPainLevelClass(painScale: number): string {
    if (painScale <= 3) return 'pain-low';
    if (painScale <= 6) return 'pain-medium';
    return 'pain-high';
  }

  getPainLevelText(painScale: number): string {
    if (painScale === 0) return 'Aucune douleur';
    if (painScale <= 3) return 'Douleur légère';
    if (painScale <= 6) return 'Douleur modérée';
    if (painScale <= 8) return 'Douleur sévère';
    return 'Douleur extrême';
  }
}
