import { Component } from '@angular/core';
@Component({
    selector: 'app-doctor-lab-results', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Lab Results</h1><p class="text-gray-600 mb-6">Review and manage patient laboratory results</p>
    <div class="space-y-4">
      <div *ngFor="let result of results" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3"><span class="text-2xl">🔬</span><div><h3 class="font-semibold text-gray-900">{{result.test}}</h3><p class="text-sm text-gray-500">Patient: {{result.patient}} • {{result.date}}</p></div></div>
          <div class="flex items-center gap-2"><span [class]="'px-3 py-1 text-xs rounded-full ' + result.statusClass">{{result.status}}</span><button class="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">Review</button></div>
        </div>
        <div *ngIf="result.findings" class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-2">{{result.findings}}</div>
      </div>
    </div>
  </div>
` })
export class DoctorLabResultsComponent {
    results = [
        { test: 'Complete Blood Count', patient: 'John Doe', date: 'Jan 15, 2024', status: 'Requires Review', statusClass: 'bg-yellow-100 text-yellow-700', findings: 'Elevated WBC count at 14,000/μL. Possible infection.' },
        { test: 'Lipid Panel', patient: 'Jane Smith', date: 'Jan 14, 2024', status: 'Reviewed', statusClass: 'bg-green-100 text-green-700', findings: 'LDL at 165 mg/dL - above optimal range. Consider statin therapy adjustment.' },
        { test: 'HbA1c', patient: 'Mike Brown', date: 'Jan 12, 2024', status: 'Requires Review', statusClass: 'bg-yellow-100 text-yellow-700', findings: 'HbA1c at 8.2% - above target of 7%. Diabetes management needs optimization.' },
        { test: 'Thyroid Panel', patient: 'Sarah Wilson', date: 'Jan 10, 2024', status: 'Reviewed', statusClass: 'bg-green-100 text-green-700', findings: 'All values within normal range. Continue current thyroid medication.' }
    ];
}
