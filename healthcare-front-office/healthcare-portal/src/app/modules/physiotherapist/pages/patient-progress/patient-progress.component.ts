import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface PatientProgress {
  patientId: number;
  patientName: string;
  patientEmail: string;
  currentTherapyType: string;
  totalSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  cancelledSessions: number;
  progressPercentage: number;
  lastSessionDate: string | null;
  lastSessionType: string | null;
  lastSessionNote: string | null;
  nextSessionDate: string | null;
  nextSessionTime: string | null;
  nextSessionType: string | null;
  status: string;
}

@Component({
  selector: 'app-patient-progress',
  templateUrl: './patient-progress.component.html',
  styleUrls: ['./patient-progress.component.css']
})
export class PatientProgressComponent implements OnInit {
  patients: PatientProgress[] = [];
  filteredPatients: PatientProgress[] = [];
  currentPhysioId: number = 0; // Will be set from localStorage
  
  filterStatus: string = 'all';
  searchTerm: string = '';
  sortBy: string = 'progress'; // progress, name, sessions
  
  selectedPatient: PatientProgress | null = null;
  showDetailModal: boolean = false;

  private apiUrl = 'http://localhost:8088/api/therapy-session';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Get the logged-in physiotherapist's ID from localStorage
    this.currentPhysioId = Number(localStorage.getItem('userId') || '0');
    if (this.currentPhysioId === 0) {
      console.error('No user ID found in localStorage');
      return;
    }
    this.loadPatientProgress();
  }

  loadPatientProgress(): void {
    this.http.get<PatientProgress[]>(`${this.apiUrl}/physiotherapist/${this.currentPhysioId}/patient-progress`)
      .subscribe({
        next: (data) => {
          this.patients = data;
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error loading patient progress:', err);
        }
      });
  }

  applyFilters(): void {
    this.filteredPatients = this.patients.filter(patient => {
      const matchesStatus = this.filterStatus === 'all' || patient.status === this.filterStatus;
      const matchesSearch = !this.searchTerm || 
        patient.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.currentTherapyType.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });

    // Appliquer le tri
    this.applySorting();
  }

  applySorting(): void {
    switch (this.sortBy) {
      case 'progress':
        this.filteredPatients.sort((a, b) => b.progressPercentage - a.progressPercentage);
        break;
      case 'name':
        this.filteredPatients.sort((a, b) => a.patientName.localeCompare(b.patientName));
        break;
      case 'sessions':
        this.filteredPatients.sort((a, b) => b.totalSessions - a.totalSessions);
        break;
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  openDetailModal(patient: PatientProgress): void {
    this.selectedPatient = patient;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedPatient = null;
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 75) return '#10b981'; // Green
    if (percentage >= 50) return '#3b82f6'; // Blue
    if (percentage >= 25) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Active': 'status-active',
      'Completed': 'status-completed',
      'Inactive': 'status-inactive'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusBadgeClass(status: string): string {
    const badgeMap: { [key: string]: string } = {
      'Active': 'bg-green-100 text-green-700',
      'Completed': 'bg-blue-100 text-blue-700',
      'Inactive': 'bg-gray-100 text-gray-700'
    };
    return badgeMap[status] || 'bg-gray-100 text-gray-700';
  }

  getAverageProgress(): string {
    if (this.patients.length === 0) return '0';
    const sum = this.patients.reduce((acc, p) => acc + p.progressPercentage, 0);
    return (sum / this.patients.length).toFixed(1);
  }

  getActivePatientCount(): number {
    return this.patients.filter(p => p.status === 'Active').length;
  }
}
