import { Component } from '@angular/core';
@Component({
    selector: 'app-doctor-dashboard', template: `
  <div class="p-8">
    <div class="mb-8"><h1 class="text-2xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1><p class="text-gray-600">Welcome back, Dr. Sarah Johnson</p></div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-3 mb-3"><span class="text-2xl">{{stat.icon}}</span><span class="text-sm font-medium text-gray-500">{{stat.title}}</span></div>
        <p class="text-xl font-bold text-gray-900">{{stat.value}}</p><p class="text-sm text-gray-500 mt-1">{{stat.subtitle}}</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Today's Appointments</h3>
        <div class="space-y-3">
          <div *ngFor="let apt of appointments" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><span>{{apt.avatar}}</span></div>
            <div class="flex-1"><p class="font-medium text-gray-900">{{apt.patient}}</p><p class="text-sm text-gray-500">{{apt.type}} • {{apt.time}}</p></div>
            <span [class]="'px-2 py-1 text-xs rounded-full ' + apt.statusClass">{{apt.status}}</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Recent Alerts</h3>
        <div class="space-y-3">
          <div *ngFor="let alert of alerts" class="flex items-center gap-4 p-3 rounded-lg" [class]="alert.bgClass">
            <span class="text-xl">{{alert.icon}}</span>
            <div class="flex-1"><p class="font-medium text-gray-900">{{alert.title}}</p><p class="text-sm text-gray-600">{{alert.description}}</p></div>
            <span class="text-xs text-gray-500">{{alert.time}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class DoctorDashboardComponent {
    stats = [
        { icon: '👥', title: 'Total Patients', value: '1,243', subtitle: '+12 this week' },
        { icon: '📅', title: "Today's Appointments", value: '8', subtitle: '3 video, 5 in-person' },
        { icon: '🚨', title: 'Critical Alerts', value: '2', subtitle: 'Requires attention' },
        { icon: '📋', title: 'Pending Reports', value: '5', subtitle: '2 urgent' }
    ];
    appointments = [
        { patient: 'John Doe', type: 'Video Call', time: '10:00 AM', avatar: '👤', status: 'Upcoming', statusClass: 'bg-blue-100 text-blue-700' },
        { patient: 'Jane Smith', type: 'In-Person', time: '11:30 AM', avatar: '👤', status: 'In Progress', statusClass: 'bg-green-100 text-green-700' },
        { patient: 'Mike Brown', type: 'Video Call', time: '2:00 PM', avatar: '👤', status: 'Waiting', statusClass: 'bg-yellow-100 text-yellow-700' },
        { patient: 'Sarah Wilson', type: 'In-Person', time: '3:30 PM', avatar: '👤', status: 'Upcoming', statusClass: 'bg-blue-100 text-blue-700' }
    ];
    alerts = [
        { icon: '🚨', title: 'Critical Lab Result', description: 'Patient John Doe - Elevated glucose levels', time: '1h ago', bgClass: 'bg-red-50' },
        { icon: '⚠️', title: 'Medication Alert', description: 'Drug interaction detected for Jane Smith', time: '3h ago', bgClass: 'bg-yellow-50' },
        { icon: '📋', title: 'Report Due', description: 'Monthly patient summary report', time: '5h ago', bgClass: 'bg-blue-50' }
    ];
}
