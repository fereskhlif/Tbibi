import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-patient-dashboard',
    template: `
    <div class="p-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
        <p class="text-gray-600">Here's an overview of your health dashboard</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">{{stat.icon}}</span>
            <span class="text-sm font-medium text-gray-500">{{stat.title}}</span>
          </div>
          <p class="text-xl font-bold text-gray-900">{{stat.value}}</p>
          <p class="text-sm text-gray-500 mt-1">{{stat.subtitle}}</p>
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
export class DashboardComponent {
    stats = [
        { icon: '📅', title: 'Next Appointment', value: 'Tomorrow, 10:00 AM', subtitle: 'Dr. Sarah Johnson' },
        { icon: '💊', title: 'Pending Medications', value: '3 medications', subtitle: '1 refill needed' },
        { icon: '🔬', title: 'Lab Results', value: '2 new results', subtitle: 'Blood work completed' },
        { icon: '📋', title: 'Health Score', value: '85/100', subtitle: 'Good condition' }
    ];

    actions = [
        { icon: '📅', title: 'Book Appointment', description: 'Schedule a teleconsultation', route: '/patient/appointments' },
        { icon: '💬', title: 'AI Health Assistant', description: 'Chat with our AI assistant', route: '/patient/chat' },
        { icon: '📋', title: 'Medical Records', description: 'View your health records', route: '/patient/records' },
        { icon: '💊', title: 'Prescriptions', description: 'View your prescriptions', route: '/patient/prescriptions' },
        { icon: '🛍️', title: 'Pharmacy Shop', description: 'Order medications online', route: '/patient/pharmacy-shop' },
        { icon: '🔬', title: 'Lab Results', description: 'Check your lab results', route: '/patient/lab-results' }
    ];

    recentActivity = [
        { icon: '📅', title: 'Appointment Confirmed', description: 'Video consultation with Dr. Sarah Johnson', time: '2 hours ago' },
        { icon: '💊', title: 'Prescription Updated', description: 'Medication dosage adjusted by Dr. Ahmed', time: '5 hours ago' },
        { icon: '🔬', title: 'Lab Results Available', description: 'Complete blood count results ready', time: '1 day ago' },
        { icon: '💬', title: 'AI Consultation', description: 'Symptom analysis completed', time: '2 days ago' },
        { icon: '💳', title: 'Payment Confirmed', description: 'Consultation fee processed', time: '3 days ago' }
    ];

    constructor(private router: Router) { }

    navigate(route: string) {
        this.router.navigate([route]);
    }
}
