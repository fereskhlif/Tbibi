import { Component } from '@angular/core';
@Component({
    selector: 'app-chronic-disease', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Chronic Disease Management</h1><p class="text-gray-600 mb-6">Monitor and manage patients with chronic conditions</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-4"><div class="flex items-center gap-3"><span class="text-2xl">{{stat.icon}}</span><div><p class="text-sm text-gray-500">{{stat.label}}</p><p class="text-lg font-bold text-gray-900">{{stat.value}}</p></div></div></div>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="font-semibold text-gray-900 mb-4">Active Chronic Patients</h3>
      <div class="space-y-3">
        <div *ngFor="let patient of patients" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-4"><div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><span>👤</span></div><div><p class="font-medium text-gray-900">{{patient.name}}</p><p class="text-sm text-gray-500">{{patient.condition}}</p></div></div>
          <div class="flex items-center gap-4"><span [class]="'px-2 py-1 text-xs rounded-full ' + patient.riskClass">{{patient.riskLevel}}</span><span class="text-sm text-gray-500">Last check: {{patient.lastCheck}}</span><button class="text-blue-600 hover:text-blue-800 text-sm">Review</button></div>
        </div>
      </div>
    </div>
  </div>
` })
export class ChronicDiseaseComponent {
    stats = [
        { icon: '📊', label: 'Total Chronic Patients', value: '156' },
        { icon: '⚠️', label: 'High Risk', value: '12' },
        { icon: '✅', label: 'Well Managed', value: '128' }
    ];
    patients = [
        { name: 'John Doe', condition: 'Hypertension Stage 2', riskLevel: 'High Risk', riskClass: 'bg-red-100 text-red-700', lastCheck: '2 days ago' },
        { name: 'Jane Smith', condition: 'Type 2 Diabetes', riskLevel: 'Medium Risk', riskClass: 'bg-yellow-100 text-yellow-700', lastCheck: '1 week ago' },
        { name: 'Mike Brown', condition: 'Coronary Artery Disease', riskLevel: 'High Risk', riskClass: 'bg-red-100 text-red-700', lastCheck: '3 days ago' },
        { name: 'Sarah Wilson', condition: 'Arrhythmia', riskLevel: 'Low Risk', riskClass: 'bg-green-100 text-green-700', lastCheck: '1 week ago' }
    ];
}
