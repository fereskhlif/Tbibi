import { Component } from '@angular/core';
@Component({
    selector: 'app-therapy-schedule', template: `
  <div class="p-8">
    <div class="flex items-center justify-between mb-6"><div><h1 class="text-2xl font-bold text-gray-900">Therapy Schedule</h1><p class="text-gray-600">Manage your therapy sessions</p></div>
    <button class="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700">+ New Session</button></div>
    <div class="grid grid-cols-1 md:grid-cols-7 gap-2 mb-8">
      <div *ngFor="let day of weekDays" [class]="'bg-white rounded-xl border p-4 text-center cursor-pointer transition-all ' + (day.today ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300')">
        <p class="text-xs text-gray-500 mb-1">{{day.name}}</p><p class="text-lg font-bold" [class]="day.today ? 'text-purple-600' : 'text-gray-900'">{{day.date}}</p><p class="text-xs text-gray-500 mt-1">{{day.sessions}} sessions</p>
      </div>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="font-semibold text-gray-900 mb-4">Today's Schedule</h3>
      <div class="space-y-3">
        <div *ngFor="let s of todaySessions" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div class="w-16 text-center"><p class="text-sm font-bold text-purple-600">{{s.time}}</p><p class="text-xs text-gray-500">{{s.duration}}</p></div>
          <div class="flex-1"><p class="font-medium text-gray-900">{{s.patient}}</p><p class="text-sm text-gray-500">{{s.type}}</p></div>
          <span [class]="'px-3 py-1 text-xs rounded-full ' + s.statusClass">{{s.status}}</span>
        </div>
      </div>
    </div>
  </div>
` })
export class TherapyScheduleComponent {
    weekDays = [
        { name: 'Mon', date: '20', sessions: 5, today: false }, { name: 'Tue', date: '21', sessions: 6, today: true },
        { name: 'Wed', date: '22', sessions: 4, today: false }, { name: 'Thu', date: '23', sessions: 7, today: false },
        { name: 'Fri', date: '24', sessions: 5, today: false }, { name: 'Sat', date: '25', sessions: 2, today: false },
        { name: 'Sun', date: '26', sessions: 0, today: false }
    ];
    todaySessions = [
        { time: '9:00', duration: '45 min', patient: 'John Doe', type: 'Post-Surgery Rehabilitation', status: 'Completed', statusClass: 'bg-green-100 text-green-700' },
        { time: '10:00', duration: '60 min', patient: 'Jane Smith', type: 'Sports Injury Recovery', status: 'Completed', statusClass: 'bg-green-100 text-green-700' },
        { time: '11:30', duration: '45 min', patient: 'Sarah Wilson', type: 'Chronic Back Pain', status: 'In Progress', statusClass: 'bg-blue-100 text-blue-700' },
        { time: '14:00', duration: '30 min', patient: 'Mike Brown', type: 'Knee Rehabilitation', status: 'Upcoming', statusClass: 'bg-gray-100 text-gray-700' },
        { time: '15:00', duration: '45 min', patient: 'Lisa Park', type: 'Posture Correction', status: 'Upcoming', statusClass: 'bg-gray-100 text-gray-700' },
        { time: '16:00', duration: '60 min', patient: 'David Kim', type: 'Shoulder Rehab', status: 'Upcoming', statusClass: 'bg-gray-100 text-gray-700' }
    ];
}
