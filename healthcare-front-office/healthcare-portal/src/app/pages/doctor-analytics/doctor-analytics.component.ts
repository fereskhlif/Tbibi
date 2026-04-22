import { Component, OnInit } from '@angular/core';
import { AppointmentAnalyticsService } from '../../services/appointment-analytics.service';
import { ChronicConditionAnalyticsService } from '../../services/chronic-condition-analytics.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-doctor-analytics',
  templateUrl: './doctor-analytics.component.html',
  styleUrls: ['./doctor-analytics.component.css']
})
export class DoctorAnalyticsComponent implements OnInit {

  // For demo, assume logged-in doctor has ID = 1 (or get from AuthService)
  doctorId: number = 1;

  // JPQL 1: Specialty Stats
  specialtyStats: any[] = [];
  chart: any;

  // Keyword 1: Filtered Appointments
  filterFrom: string = '2026-01-01';
  filterTo: string = '2026-12-31';
  filterStatus: string = 'PENDING';
  filteredAppointments: any[] = [];

  // JPQL 2: Health Summary
  healthSummary: any[] = [];

  // Keyword 2: Recent Critical
  criticalHours: number = 24;
  recentCritical: any[] = [];

  constructor(
    private apptSvc: AppointmentAnalyticsService,
    private chronicSvc: ChronicConditionAnalyticsService
  ) { }

  ngOnInit(): void {
    // We can try to get doctor ID from localstorage if available
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.userId) this.doctorId = user.userId;
      else if (user.id) this.doctorId = user.id;
    }

    this.loadAllData();
  }

  loadAllData() {
    this.loadSpecialtyStats();
    this.loadFilteredAppointments();
    this.loadHealthSummary();
    this.loadRecentCritical();
  }

  loadSpecialtyStats() {
    this.apptSvc.getSpecialtyStats(this.doctorId).subscribe({
      next: (data) => {
        this.specialtyStats = data;
        this.renderChart();
      },
      error: (err) => console.error("Error loading specialty stats:", err)
    });
  }

  loadFilteredAppointments() {
    this.apptSvc.getFilteredAppointments(this.doctorId, this.filterFrom, this.filterTo, this.filterStatus)
      .subscribe({
        next: (data) => this.filteredAppointments = data,
        error: (err) => console.error("Error loading filtered appointments:", err)
      });
  }

  loadHealthSummary() {
    this.chronicSvc.getHealthSummary(this.doctorId).subscribe({
      next: (data) => this.healthSummary = data,
      error: (err) => console.error("Error loading health summary:", err)
    });
  }

  loadRecentCritical() {
    this.chronicSvc.getRecentCritical(this.doctorId, this.criticalHours).subscribe({
      next: (data) => this.recentCritical = data,
      error: (err) => console.error("Error loading recent critical readings:", err)
    });
  }

  renderChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    
    const labels = this.specialtyStats.map(s => s.specialty || 'Unspecified');
    const counts = this.specialtyStats.map(s => s.count);

    this.chart = new Chart('specialtyChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Appointments',
          data: counts,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
}
