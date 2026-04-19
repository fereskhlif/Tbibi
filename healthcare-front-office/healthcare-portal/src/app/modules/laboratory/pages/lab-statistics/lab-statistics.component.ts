import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface PatientStatistics {
  patientId: number;
  patientName: string;
  patientEmail: string;
  totalTests: number;
  completedTests: number;
  pendingTests: number;
  urgentTests: number;
  completionRate: number;
}

@Component({
  selector: 'app-lab-statistics',
  templateUrl: './lab-statistics.component.html',
  styleUrls: ['./lab-statistics.component.css']
})
export class LabStatisticsComponent implements OnInit {
  statistics: PatientStatistics[] = [];
  isLoading = false;
  currentLabUserId: number = 0;
  
  private apiUrl = 'http://localhost:8088/api/laboratory-results';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.currentLabUserId = Number(localStorage.getItem('userId') || '0');
    if (this.currentLabUserId === 0) {
      console.error('No user ID found in localStorage');
      return;
    }
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading = true;
    this.http.get<PatientStatistics[]>(`${this.apiUrl}/statistics/patients/${this.currentLabUserId}`)
      .subscribe({
        next: (data) => {
          this.statistics = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading statistics:', err);
          this.isLoading = false;
        }
      });
  }

  getCompletionColor(rate: number): string {
    if (rate >= 80) return '#10b981';
    if (rate >= 50) return '#f59e0b';
    return '#ef4444';
  }

  getTotalTests(): number {
    return this.statistics.reduce((sum, stat) => sum + stat.totalTests, 0);
  }

  getTotalCompleted(): number {
    return this.statistics.reduce((sum, stat) => sum + stat.completedTests, 0);
  }

  getTotalPending(): number {
    return this.statistics.reduce((sum, stat) => sum + stat.pendingTests, 0);
  }

  getTotalUrgent(): number {
    return this.statistics.reduce((sum, stat) => sum + stat.urgentTests, 0);
  }
}
