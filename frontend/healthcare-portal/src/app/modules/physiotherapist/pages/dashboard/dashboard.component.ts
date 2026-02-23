import { Component } from '@angular/core';
@Component({
    selector: 'app-physio-dashboard', template: `
  <div class="p-8">
    <div class="mb-8"><h1 class="text-2xl font-bold text-gray-900 mb-2">Physiotherapy Dashboard</h1><p class="text-gray-600">Welcome back, Dr. Marie Laurent</p></div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-3 mb-3"><span class="text-2xl">{{stat.icon}}</span><span class="text-sm text-gray-500">{{stat.title}}</span></div>
        <p class="text-xl font-bold text-gray-900">{{stat.value}}</p><p class="text-sm text-gray-500 mt-1">{{stat.subtitle}}</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Today's Sessions</h3>
        <div class="space-y-3">
          <div *ngFor="let s of sessions" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span class="text-xl">🏃</span><div class="flex-1"><p class="font-medium text-gray-900">{{s.patient}}</p><p class="text-sm text-gray-500">{{s.type}} • {{s.time}}</p></div>
            <span [class]="'px-2 py-1 text-xs rounded-full ' + s.statusClass">{{s.status}}</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Patient Progress Overview</h3>
        <div class="space-y-4">
          <div *ngFor="let p of progressItems" class="space-y-1">
            <div class="flex justify-between text-sm"><span class="text-gray-700">{{p.patient}}</span><span class="font-medium">{{p.progress}}%</span></div>
            <div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-purple-500 h-2 rounded-full" [style.width.%]="p.progress"></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class PhysioDashboardComponent {
    stats = [
        { icon: '👥', title: 'Active Patients', value: '34', subtitle: '+3 this week' },
        { icon: '📅', title: "Today's Sessions", value: '6', subtitle: '2 completed' },
        { icon: '📈', title: 'Avg Recovery Rate', value: '87%', subtitle: '+5% this month' },
        { icon: '⏰', title: 'Next Session', value: '11:30 AM', subtitle: 'Sarah Wilson' }
    ];
    sessions = [
        { patient: 'John Doe', type: 'Post-Surgery Rehab', time: '9:00 AM', status: 'Completed', statusClass: 'bg-green-100 text-green-700' },
        { patient: 'Jane Smith', type: 'Sports Injury', time: '10:30 AM', status: 'Completed', statusClass: 'bg-green-100 text-green-700' },
        { patient: 'Sarah Wilson', type: 'Back Pain Therapy', time: '11:30 AM', status: 'Next', statusClass: 'bg-blue-100 text-blue-700' },
        { patient: 'Mike Brown', type: 'Knee Rehabilitation', time: '2:00 PM', status: 'Upcoming', statusClass: 'bg-gray-100 text-gray-700' }
    ];
    progressItems = [
        { patient: 'John Doe', progress: 75 }, { patient: 'Jane Smith', progress: 60 },
        { patient: 'Sarah Wilson', progress: 45 }, { patient: 'Mike Brown', progress: 30 }
    ];
}
