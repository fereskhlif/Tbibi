import { environment } from 'environments/environment';
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

interface Statistics {
  totalAnalyses: number;
  completedAnalyses: number;
  pendingAnalyses: number;
  fractureDetected: number;
  noFractureDetected: number;
  fractureRate: number;
  analysesByCategory: { [key: string]: number };
  analysesByStatus: { [key: string]: number };
  averageConfidence: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  analysesLast7Days: { [key: string]: number };
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
  statistics: Statistics | null = null;
  isLoading = false;
  searchTerm = '';
  selectedCategory = 'All';
  activeTab: 'analyses' | 'statistics' = 'analyses';

  private apiUrl = `${environment.baseUrl}/api`;
  private imageBaseUrl = `${environment.baseUrl}/uploads/medical-pictures/`;

  categoryOptions = ['All', 'Radio', 'Scanner', 'IRM', 'Echographie'];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadPatientsWithAnalyses();
    this.loadStatistics();
  }

  loadPatientsWithAnalyses(): void {
    this.isLoading = true;

    this.http.get<MedicalPictureAnalysis[]>(`${this.apiUrl}/medical-picture-analysis`)
      .subscribe({
        next: (analyses) => {
          this.analyses = analyses.filter(a =>
            a.analysisResult &&
            a.confidenceScore &&
            a.status === 'Completed'
          );

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
    const patientIds = [...new Set(
      this.analyses
        .map(a => a.laboratoryResultId)
        .filter(id => id != null)
    )];

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
                  email: ''
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

    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(a => a.category === this.selectedCategory);
    }

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

  downloadPdf(analysisId: number): void {
    const url = `${this.apiUrl}/medical-picture-analysis/${analysisId}/report/pdf`;
    window.open(url, '_blank');
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

  formatDateShort(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  clearSelection(): void {
    this.selectedPatient = null;
    this.filteredAnalyses = [];
    this.searchTerm = '';
    this.selectedCategory = 'All';
  }

  loadStatistics(): void {
    this.http.get<Statistics>(`${this.apiUrl}/medical-picture-analysis/statistics`)
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: (err) => console.error('Error loading statistics:', err)
      });
  }

  getCategoryKeys(): string[] {
    return this.statistics ? Object.keys(this.statistics.analysesByCategory) : [];
  }

  getStatusKeys(): string[] {
    return this.statistics ? Object.keys(this.statistics.analysesByStatus) : [];
  }

  getLast7DaysKeys(): string[] {
    return this.statistics ? Object.keys(this.statistics.analysesLast7Days) : [];
  }
}
