import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { LaboratoryResultService } from '../../services/laboratory-result.service';
import { PrescriptionService } from '../../../../services/prescription-service.service';

@Component({
  selector: 'app-patient-dashboard',
  template: `
    <div class="p-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome back{{userName ? ', ' + userName : ''}}!</h1>
        <p class="text-gray-600">Here's an overview of your health dashboard</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">{{stat.icon}}</span>
            <span class="text-sm font-medium text-gray-500">{{stat.title}}</span>
          </div>
          <p class="text-xl font-bold text-gray-900 truncate" [title]="stat.value">{{stat.value}}</p>
          <p class="text-sm text-gray-500 mt-1 truncate" [title]="stat.subtitle">{{stat.subtitle}}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let action of actions" (click)="navigate(action.route)"
               class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
            <div class="flex items-center gap-4">
              <span class="text-3xl">{{action.icon}}</span>
              <div>
                <h3 class="font-semibold text-gray-900">{{action.title}}</h3>
                <p class="text-sm text-gray-600">{{action.description}}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
          <div *ngFor="let activity of recentActivity" class="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
            <span class="text-2xl">{{activity.icon}}</span>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{activity.title}}</h4>
              <p class="text-sm text-gray-600">{{activity.description}}</p>
            </div>
            <span class="text-sm text-gray-500 whitespace-nowrap">{{activity.time}}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  userName = '';

  stats = [
    { id: 'appointment', icon: '📅', title: 'Next Appointment', value: 'Loading...', subtitle: 'Please wait' },
    { id: 'medication', icon: '💊', title: 'Pending Medications', value: 'Loading...', subtitle: 'Please wait' },
    { id: 'lab', icon: '🔬', title: 'Lab Results', value: 'Loading...', subtitle: 'Please wait' },
    { id: 'health', icon: '📋', title: 'Health Score', value: 'Loading...', subtitle: 'Please wait' }
  ];

  actions = [
    { icon: '📅', title: 'Book Appointment', description: 'Schedule a teleconsultation', route: '/patient/book-appointment' },
    { icon: '💬', title: 'AI Health Assistant', description: 'Chat with our AI assistant', route: '/patient/ai-chat' },
    { icon: '📋', title: 'Medical Records', description: 'View your health records', route: '/patient/medical-records' },
    { icon: '💊', title: 'Prescriptions', description: 'View your prescriptions', route: '/patient/prescriptions' },
    { icon: '🛍️', title: 'Pharmacy Shop', description: 'Order medications online', route: '/patient/pharmacy-shop' },
    { icon: '🔬', title: 'Lab Results', description: 'Check your lab results', route: '/patient/lab-results' }
  ];

  recentActivity = [
    { icon: '🚀', title: 'Welcome to your Dashboard', description: 'Explore our new features.', time: 'Just now' }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private prescriptionService: PrescriptionService,
    private labResultService: LaboratoryResultService
  ) { }

  ngOnInit() {
    this.loadNextAppointment();
    this.loadPendingMedications();
    this.loadLabResults();
    this.loadHealthScore();

    // Set username if stored
    const email = localStorage.getItem('email');
    if (email) {
      this.userName = email.split('@')[0];
    }
  }

  getStat(id: string) {
    return this.stats.find(s => s.id === id);
  }

  loadNextAppointment() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      const stat = this.getStat('appointment');
      if (stat) { stat.value = 'Not logged in'; stat.subtitle = ''; }
      return;
    }

    this.appointmentService.getPatientAppointments(userId).subscribe({
      next: (appointments) => {
        const now = new Date();
        const upcoming = appointments
          .filter(a => {
            const dateStr = a.scheduleDate + 'T' + a.scheduleTime;
            return new Date(dateStr) > now && a.statusAppointement !== 'CANCELLED';
          })
          .sort((a, b) => new Date(a.scheduleDate + 'T' + a.scheduleTime).getTime() - new Date(b.scheduleDate + 'T' + b.scheduleTime).getTime());

        const stat = this.getStat('appointment');
        if (stat) {
          if (upcoming.length > 0) {
            const next = upcoming[0];
            const dateObj = new Date(next.scheduleDate + 'T' + next.scheduleTime);

            // Format as "Tomorrow, 10:00 AM" or "Apr 28, 10:00 AM"
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            let dateStr = '';
            if (dateObj.toDateString() === today.toDateString()) {
              dateStr = 'Today';
            } else if (dateObj.toDateString() === tomorrow.toDateString()) {
              dateStr = 'Tomorrow';
            } else {
              dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }

            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            stat.value = `${dateStr}, ${timeStr}`;
            // If the user meant patient name, we can include it, but Dr. name makes more sense on a patient dashboard
            stat.subtitle = ` ${next.doctor} `;
          } else {
            stat.value = 'No upcoming';
            stat.subtitle = 'Book one now!';
          }
        }
      },
      error: () => {
        const stat = this.getStat('appointment');
        if (stat) { stat.value = 'Error'; stat.subtitle = 'Could not load'; }
      }
    });
  }

  loadPendingMedications() {
    this.prescriptionService.getMyPrescriptions().subscribe({
      next: (prescriptions: any[]) => {
        const pending = prescriptions.filter((p: any) => p.status === 'PENDING' || p.status === 'VALIDATED');
        const stat = this.getStat('medication');
        if (stat) {
          stat.value = `${pending.length} prescriptions`;
          stat.subtitle = pending.length > 0 ? 'Action required' : 'All caught up';
        }
      },
      error: () => {
        const stat = this.getStat('medication');
        if (stat) { stat.value = 'Error'; stat.subtitle = 'Could not load'; }
      }
    });
  }

  loadLabResults() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.labResultService.getByPatient(userId).subscribe({
      next: (results) => {
        const stat = this.getStat('lab');
        if (stat) {
          stat.value = `${results.length} results`;
          stat.subtitle = results.length > 0 ? 'Check them out' : 'No recent results';
        }
      },
      error: () => {
        const stat = this.getStat('lab');
        if (stat) { stat.value = 'Error'; stat.subtitle = 'Could not load'; }
      }
    });
  }

  loadHealthScore() {
    const patientId = this.authService.getCurrentUserId();
    if (!patientId) {
      const stat = this.getStat('health');
      if (stat) { stat.value = 'N/A'; stat.subtitle = 'Not logged in'; }
      return;
    }

    this.http.get<any[]>(`http://localhost:8088/api/chronic/patient/${patientId}`).subscribe({
      next: (records) => {
        records = records || [];
        if (records.length === 0) {
          const stat = this.getStat('health');
          if (stat) { stat.value = 'N/A'; stat.subtitle = 'No smartwatch data'; }
          return;
        }

        const avg = (type: string) => {
          const vals = records
            .filter(r => r.conditionType === type && r.value != null)
            .map(r => parseFloat(r.value));
          return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        };

        const avgBloodPressure = avg('BLOOD_PRESSURE') || 120;
        const avgBloodSugar = avg('BLOOD_SUGAR') || 95;

        const body = {
          age: 40,
          bmi: 25.0,
          systolic_bp: Math.round(avgBloodPressure),
          fasting_glucose: Math.round(avgBloodSugar),
          smoking: 0,
          physical_activity: 3,
          family_history: 0,
          cholesterol: 190,
        };

        this.http.post<any>('http://localhost:8088/api/disease-risk/predict', body).subscribe({
          next: (r) => {
            const stat = this.getStat('health');
            if (stat) {
              stat.value = r.overallRisk + ' RISK';
              stat.subtitle = r.summary || 'Based on your vitals';

              if (r.overallRisk === 'HIGH') stat.icon = '🚨';
              else if (r.overallRisk === 'MEDIUM') stat.icon = '⚠️';
              else stat.icon = '✅';
            }
          },
          error: () => {
            const stat = this.getStat('health');
            if (stat) { stat.value = 'Error'; stat.subtitle = 'Prediction failed'; }
          }
        });
      },
      error: () => {
        const stat = this.getStat('health');
        if (stat) { stat.value = 'Error'; stat.subtitle = 'Could not load vitals'; }
      }
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
