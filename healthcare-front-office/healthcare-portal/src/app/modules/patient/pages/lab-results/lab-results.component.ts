import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

interface LabResult {
  labId: number;
  testName: string;
  nameLabo: string;
  testDate: string;
  status: string;
  resultValue?: string;
  priority: string;
  hasMedicalPicture: boolean;
  medicalPictureId?: number;
  expanded?: boolean;
}

@Component({
  selector: 'app-lab-results',
  templateUrl: './lab-results.component.html',
  styleUrls: ['./lab-results.component.css']
})
export class LabResultsComponent implements OnInit {
  results: LabResult[] = [];
  loading = true;

  private apiUrl = `${environment.baseUrl}/api`;
  private get patientId(): number {
    return Number(localStorage.getItem('userId') || 0);
  }

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/laboratory-results/patient/${this.patientId}`)
      .subscribe({
        next: (data) => {
          this.results = data.map(item => ({
            labId: item.labId,
            testName: item.testName,
            nameLabo: item.nameLabo,
            testDate: item.testDate,
            status: item.status,
            resultValue: item.resultValue,
            priority: item.priority || 'Normal',
            hasMedicalPicture: item.hasMedicalPicture || false,
            medicalPictureId: item.medicalPictureId,
            expanded: false
          }));
          this.loading = false;
          console.log('Loaded patient lab results:', this.results.length);
        },
        error: (err) => {
          console.error('Error loading lab results:', err);
          this.loading = false;
        }
      });
  }

  toggleResult(result: LabResult): void {
    result.expanded = !result.expanded;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Validated': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'Urgent': return 'bg-orange-100 text-orange-700';
      case 'Normal': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  downloadPdf(result: LabResult): void {
    if (result.hasMedicalPicture && result.medicalPictureId) {
      // PDF avec analyse d'image IA
      const url = `${this.apiUrl}/medical-picture-analysis/${result.medicalPictureId}/report/pdf`;
      window.open(url, '_blank');
    } else {
      // PDF standard du résultat de laboratoire
      const url = `${this.apiUrl}/laboratory-results/${result.labId}/report/pdf`;
      window.open(url, '_blank');
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
