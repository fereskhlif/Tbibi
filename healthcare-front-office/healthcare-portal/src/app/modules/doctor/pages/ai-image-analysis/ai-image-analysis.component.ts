import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Patient {
  userId: number;
  name: string;
  email: string;
}

interface MedicalPictureAnalysis {
  picId: number;
  imageName: string;
  category: string;
  analysisResult: string;
  confidenceScore: number;
  status: string;
  uploadDate: string;
  laboratoryResultId: number;
  testName?: string;
  nameLabo?: string;
}

@Component({
  selector: 'app-ai-image-analysis',
  templateUrl: './ai-image-analysis.component.html',
  styleUrls: ['./ai-image-analysis.component.css']
})
export class AiImageAnalysisComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  analyses: MedicalPictureAnalysis[] = [];
  filteredAnalyses: MedicalPictureAnalysis[] = [];
  
  isLoading = false;
  searchTerm = '';
  selectedCategory = 'All';
  
  private apiUrl = 'http://localhost:8088/api';
  private imageBaseUrl = 'http://localhost:8088/uploads/medical-pictures/';

  categoryOptions = ['All', 'Radio', 'Scanner', 'IRM', 'Echographie'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPatientsWithAnalyses();
  }

  loadPatientsWithAnalyses(): void {
    this.isLoading = true;
    
    // Charger toutes les analyses médicales
    this.http.get<MedicalPictureAnalysis[]>(`${this.apiUrl}/medical-picture-analysis`)
      .subscribe({
        next: (analyses) => {
          // Filtrer uniquement les analyses qui ont été traitées par l'IA
          this.analyses = analyses.filter(a => 
            a.analysisResult && 
            a.confidenceScore && 
            a.status === 'Completed'
          );
          
          // Extraire les patients uniques
          this.extractUniquePatients();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading analyses:', err);
          this.isLoading = false;
        }
      });
  }

  extractUniquePatients(): void {
    // Récupérer les IDs de patients uniques depuis les analyses
    const patientIds = [...new Set(
      this.analyses
        .map(a => a.laboratoryResultId)
        .filter(id => id != null)
    )];

    // Charger les infos des patients
    if (patientIds.length > 0) {
      this.http.get<any[]>(`${this.apiUrl}/laboratory-results`)
        .subscribe({
          next: (labResults) => {
            const uniquePatients = new Map<number, Patient>();
            
            labResults.forEach(lr => {
              if (lr.patientId && lr.patientName) {
                uniquePatients.set(lr.patientId, {
                  userId: lr.patientId,
                  name: lr.patientName,
                  email: '' // Pas disponible dans lab results
                });
              }
            });
            
            this.patients = Array.from(uniquePatients.values());
          },
          error: (err) => console.error('Error loading patients:', err)
        });
    }
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.filterAnalysesByPatient();
  }

  filterAnalysesByPatient(): void {
    if (!this.selectedPatient) {
      this.filteredAnalyses = [];
      return;
    }

    // Filtrer les analyses pour ce patient
    this.http.get<any[]>(`${this.apiUrl}/laboratory-results`)
      .subscribe({
        next: (labResults) => {
          const patientLabIds = labResults
            .filter(lr => lr.patientId === this.selectedPatient!.userId)
            .map(lr => lr.labId);
          
          this.filteredAnalyses = this.analyses.filter(a => 
            patientLabIds.includes(a.laboratoryResultId)
          );
          
          this.applyFilters();
        },
        error: (err) => console.error('Error filtering analyses:', err)
      });
  }

  applyFilters(): void {
    let filtered = [...this.filteredAnalyses];

    // Filtre par catégorie
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(a => a.category === this.selectedCategory);
    }

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.analysisResult?.toLowerCase().includes(term) ||
        a.category?.toLowerCase().includes(term)
      );
    }

    this.filteredAnalyses = filtered;
  }

  getImageUrl(imageName: string): string {
    return `${this.imageBaseUrl}${imageName}`;
  }

  getConfidenceClass(score: number): string {
    if (score >= 0.8) return 'confidence-high';
    if (score >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  }

  getConfidenceLabel(score: number): string {
    if (score >= 0.8) return 'Haute confiance';
    if (score >= 0.6) return 'Confiance moyenne';
    return 'Confiance faible';
  }

  getPredictionClass(result: string): string {
    if (result.toLowerCase().includes('fracture')) {
      return 'prediction-fracture';
    }
    return 'prediction-normal';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  clearSelection(): void {
    this.selectedPatient = null;
    this.filteredAnalyses = [];
    this.searchTerm = '';
    this.selectedCategory = 'All';
  }
}
