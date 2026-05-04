import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

interface LabResult {
  labId: number;
  testName: string;
  patientName: string;
  patientId: number;
  testDate: string;
  status: string;
  resultValue?: string;
  nameLabo: string;
  hasMedicalPicture: boolean;
  medicalPictureId?: number;
}

@Component({
  selector: 'app-doctor-lab-results',
  templateUrl: './lab-results.component.html',
  styleUrls: ['./lab-results.component.css']
})
export class DoctorLabResultsComponent implements OnInit {
  results: LabResult[] = [];
  filteredResults: LabResult[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = 'all';
  // Modal de prescription
  showPrescribeModal = false;
  submitting = false;
  prescriptionForm = {
    patientEmail: '',
    testName: '',
    location: '',
    priority: 'Normal',
    requestNotes: ''
  };

  private apiUrl = `${environment.baseUrl}/api`;
  private get doctorId(): number {
    return Number(localStorage.getItem('userId') || 0);
  }

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.loading = true;
    // Charger TOUS les résultats validés (pas seulement ceux prescrits par ce docteur)
    this.http.get<any[]>(`${this.apiUrl}/laboratory-results`)
      .subscribe({
        next: (data) => {
          this.results = data.map(item => ({
            labId: item.labId,
            testName: item.testName,
            patientName: item.patientName || 'Unknown',
            patientId: item.patientId,
            testDate: item.testDate,
            status: item.status,
            resultValue: item.resultValue,
            nameLabo: item.nameLabo,
            hasMedicalPicture: item.hasMedicalPicture || false,
            medicalPictureId: item.medicalPictureId
          }));
          this.filteredResults = this.results;
          this.loading = false;
          console.log('Loaded lab results:', this.results.length);
        },
        error: (err) => {
          console.error('Error loading lab results:', err);
          this.loading = false;
        }
      });
  }

  filterResults(): void {
    this.filteredResults = this.results.filter(result => {
      const matchesSearch = result.testName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        result.patientName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || result.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
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

  downloadPdf(result: LabResult): void {
    if (result.hasMedicalPicture && result.medicalPictureId) {
      // Télécharger le PDF de l'analyse d'image médicale (avec IA)
      const url = `${this.apiUrl}/medical-picture-analysis/${result.medicalPictureId}/report/pdf`;
      window.open(url, '_blank');
    } else {
      // Télécharger le PDF du résultat de laboratoire standard
      const url = `${this.apiUrl}/laboratory-results/${result.labId}/report/pdf`;
      window.open(url, '_blank');
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  openPrescribeModal(): void {
    this.showPrescribeModal = true;
    // Réinitialiser le formulaire
    this.prescriptionForm = {
      patientEmail: '',
      testName: '',
      location: '',
      priority: 'Normal',
      requestNotes: ''
    };
  }

  closePrescribeModal(): void {
    this.showPrescribeModal = false;
  }

  submitPrescription(): void {
    // Validation
    if (!this.prescriptionForm.patientEmail || !this.prescriptionForm.testName) {
      alert('Veuillez remplir l\'email du patient et le type de test');
      return;
    }

    this.submitting = true;

    // Créer la demande de test
    const request = {
      patientEmail: this.prescriptionForm.patientEmail,
      testName: this.prescriptionForm.testName,
      location: this.prescriptionForm.location || 'Non spécifié',
      priority: this.prescriptionForm.priority,
      requestNotes: this.prescriptionForm.requestNotes,
      prescribedByDoctorId: this.doctorId
    };

    this.http.post(`${this.apiUrl}/laboratory-results/prescribe`, request)
      .subscribe({
        next: (response) => {
          console.log('Prescription créée:', response);
          alert('✅ Test prescrit avec succès! Le laboratoire recevra la demande.');
          this.closePrescribeModal();
          this.loadResults(); // Recharger la liste
          this.submitting = false;
        },
        error: (err) => {
          console.error('Erreur lors de la prescription:', err);
          const errorMsg = err.error?.error || 'Erreur lors de la prescription du test';
          alert('❌ ' + errorMsg);
          this.submitting = false;
        }
      });
  }
}
