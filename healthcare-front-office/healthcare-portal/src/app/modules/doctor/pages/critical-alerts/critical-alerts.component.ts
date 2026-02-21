import { Component } from '@angular/core';
@Component({
    selector: 'app-critical-alerts', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Critical Alerts</h1><p class="text-gray-600 mb-6">Urgent patient notifications and alerts</p>
    <div class="space-y-4">
      <div *ngFor="let alert of alerts" [class]="'rounded-xl border-2 p-6 ' + alert.borderClass">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3"><span class="text-2xl">{{alert.icon}}</span><div><h3 class="font-semibold text-gray-900">{{alert.title}}</h3><p class="text-sm text-gray-500">Patient: {{alert.patient}} • {{alert.time}}</p></div></div>
          <span [class]="'px-3 py-1 text-xs rounded-full font-medium ' + alert.severityClass">{{alert.severity}}</span>
        </div>
        <p class="text-gray-700 mb-4">{{alert.description}}</p>
        <div class="flex gap-2"><button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Take Action</button><button class="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Dismiss</button></div>
      </div>
    </div>
  </div>
` })
export class CriticalAlertsComponent {
    alerts = [
        { icon: '🚨', title: 'Critical Lab Result', patient: 'John Doe', time: '1 hour ago', description: 'Blood glucose level at 350 mg/dL - significantly above normal range. Immediate intervention may be required.', severity: 'Critical', severityClass: 'bg-red-100 text-red-700', borderClass: 'border-red-300 bg-red-50' },
        { icon: '⚠️', title: 'Drug Interaction Warning', patient: 'Jane Smith', time: '3 hours ago', description: 'Potential interaction between Metformin and newly prescribed Cimetidine. May increase risk of lactic acidosis.', severity: 'High', severityClass: 'bg-orange-100 text-orange-700', borderClass: 'border-orange-300 bg-orange-50' },
        { icon: '📊', title: 'Abnormal Vital Signs', patient: 'Mike Brown', time: '5 hours ago', description: 'Blood pressure reading of 180/110 reported by home monitoring device. Above critical threshold.', severity: 'High', severityClass: 'bg-orange-100 text-orange-700', borderClass: 'border-orange-300 bg-orange-50' },
        { icon: '💊', title: 'Missed Medication Alert', patient: 'Sarah Wilson', time: '1 day ago', description: 'Patient has missed Warfarin dose for 2 consecutive days. Anticoagulation therapy may be compromised.', severity: 'Medium', severityClass: 'bg-yellow-100 text-yellow-700', borderClass: 'border-yellow-300 bg-yellow-50' }
    ];
}
