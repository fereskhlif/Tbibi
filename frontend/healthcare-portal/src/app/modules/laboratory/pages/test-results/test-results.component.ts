import { Component } from '@angular/core';
@Component({
    selector: 'app-test-results', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Test Results</h1><p class="text-gray-600 mb-6">Review and publish test results</p>
    <div class="space-y-4">
      <div *ngFor="let result of results" class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-3"><div><h3 class="font-semibold text-gray-900">{{result.test}} - {{result.patient}}</h3><p class="text-sm text-gray-500">Sample: {{result.sampleId}} • Requested by Dr. {{result.doctor}}</p></div>
        <span [class]="'px-3 py-1 text-xs rounded-full ' + result.statusClass">{{result.status}}</span></div>
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div *ngFor="let item of result.items" class="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
            <span class="text-sm text-gray-700">{{item.parameter}}</span>
            <div class="flex items-center gap-4"><span class="text-sm font-medium text-gray-900">{{item.value}}</span><span class="text-xs text-gray-400">{{item.reference}}</span>
            <span [class]="'w-2 h-2 rounded-full ' + (item.normal ? 'bg-green-500' : 'bg-red-500')"></span></div>
          </div>
        </div>
        <div class="flex gap-2" *ngIf="result.status === 'Pending Review'"><button class="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">Approve & Publish</button><button class="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Request Retest</button></div>
      </div>
    </div>
  </div>
` })
export class TestResultsComponent {
    results = [
        {
            test: 'Complete Blood Count', patient: 'John Doe', sampleId: 'SMP-2024-001', doctor: 'Sarah Johnson', status: 'Pending Review', statusClass: 'bg-yellow-100 text-yellow-700',
            items: [{ parameter: 'Hemoglobin', value: '14.2 g/dL', reference: '13.5-17.5', normal: true }, { parameter: 'WBC', value: '14,000 /μL', reference: '4,500-11,000', normal: false }, { parameter: 'Platelets', value: '250,000 /μL', reference: '150,000-400,000', normal: true }]
        },
        {
            test: 'Thyroid Panel', patient: 'Sarah Wilson', sampleId: 'SMP-2024-004', doctor: 'Lisa Park', status: 'Published', statusClass: 'bg-green-100 text-green-700',
            items: [{ parameter: 'TSH', value: '2.5 mIU/L', reference: '0.4-4.0', normal: true }, { parameter: 'Free T4', value: '1.2 ng/dL', reference: '0.8-1.8', normal: true }]
        }
    ];
}
