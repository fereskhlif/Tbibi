import { Component } from '@angular/core';
@Component({
    selector: 'app-patient-records', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Patient Records</h1><p class="text-gray-600 mb-6">Manage and review patient medical records</p>
    <div class="mb-6"><input type="text" [(ngModel)]="search" class="w-full px-4 py-3 border border-gray-300 rounded-xl" placeholder="Search patients..." /></div>
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
        <tbody class="divide-y divide-gray-200">
          <tr *ngFor="let p of filteredPatients" class="hover:bg-gray-50">
            <td class="px-6 py-4"><div class="flex items-center gap-3"><div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">{{p.avatar}}</div><span class="font-medium text-gray-900">{{p.name}}</span></div></td>
            <td class="px-6 py-4 text-gray-600">{{p.age}}</td><td class="px-6 py-4 text-gray-600">{{p.condition}}</td><td class="px-6 py-4 text-gray-600">{{p.lastVisit}}</td>
            <td class="px-6 py-4"><span [class]="'px-2 py-1 text-xs rounded-full ' + p.statusClass">{{p.status}}</span></td>
            <td class="px-6 py-4"><button class="text-blue-600 hover:text-blue-800 text-sm">View Details</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
` })
export class PatientRecordsComponent {
    search = '';
    patients = [
        { name: 'John Doe', age: 34, condition: 'Hypertension', lastVisit: 'Jan 15, 2024', avatar: '👤', status: 'Active', statusClass: 'bg-green-100 text-green-700' },
        { name: 'Jane Smith', age: 28, condition: 'Diabetes Type 2', lastVisit: 'Jan 12, 2024', avatar: '👤', status: 'Follow-up', statusClass: 'bg-yellow-100 text-yellow-700' },
        { name: 'Mike Brown', age: 45, condition: 'Coronary Artery Disease', lastVisit: 'Jan 10, 2024', avatar: '👤', status: 'Critical', statusClass: 'bg-red-100 text-red-700' },
        { name: 'Sarah Wilson', age: 52, condition: 'Arrhythmia', lastVisit: 'Jan 8, 2024', avatar: '👤', status: 'Stable', statusClass: 'bg-blue-100 text-blue-700' },
        { name: 'David Kim', age: 61, condition: 'Heart Failure', lastVisit: 'Jan 5, 2024', avatar: '👤', status: 'Monitoring', statusClass: 'bg-purple-100 text-purple-700' }
    ];
    get filteredPatients() { return this.search ? this.patients.filter(p => p.name.toLowerCase().includes(this.search.toLowerCase())) : this.patients; }
}
