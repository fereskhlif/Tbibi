import { Component } from '@angular/core';
@Component({
    selector: 'app-sample-management', template: `
  <div class="p-8">
    <div class="flex items-center justify-between mb-6"><div><h1 class="text-2xl font-bold text-gray-900">Sample Management</h1><p class="text-gray-600">Track and manage laboratory samples</p></div>
    <button class="px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">+ Register Sample</button></div>
    <div class="flex gap-2 mb-6">
      <button *ngFor="let f of filters" (click)="activeFilter = f" [class]="'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (activeFilter === f ? 'bg-cyan-600 text-white' : 'bg-white text-gray-600 border border-gray-200')">{{f}}</button>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sample ID</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
      <tbody class="divide-y divide-gray-200">
        <tr *ngFor="let s of filteredSamples" class="hover:bg-gray-50">
          <td class="px-6 py-4 font-mono text-sm text-blue-600">{{s.id}}</td>
          <td class="px-6 py-4 text-sm text-gray-900">{{s.patient}}</td>
          <td class="px-6 py-4 text-sm text-gray-600">{{s.test}}</td>
          <td class="px-6 py-4 text-sm text-gray-600">{{s.collected}}</td>
          <td class="px-6 py-4"><span [class]="'px-2 py-1 text-xs rounded-full ' + s.statusClass">{{s.status}}</span></td>
        </tr></tbody></table>
    </div>
  </div>
` })
export class SampleManagementComponent {
    activeFilter = 'All';
    filters = ['All', 'Received', 'Processing', 'Completed'];
    samples = [
        { id: 'SMP-2024-001', patient: 'John Doe', test: 'CBC', collected: 'Jan 15, 9:00 AM', status: 'Processing', statusClass: 'bg-blue-100 text-blue-700' },
        { id: 'SMP-2024-002', patient: 'Jane Smith', test: 'Lipid Panel', collected: 'Jan 15, 9:30 AM', status: 'Received', statusClass: 'bg-yellow-100 text-yellow-700' },
        { id: 'SMP-2024-003', patient: 'Mike Brown', test: 'HbA1c', collected: 'Jan 15, 10:00 AM', status: 'Processing', statusClass: 'bg-blue-100 text-blue-700' },
        { id: 'SMP-2024-004', patient: 'Sarah Wilson', test: 'Thyroid Panel', collected: 'Jan 14, 3:00 PM', status: 'Completed', statusClass: 'bg-green-100 text-green-700' },
        { id: 'SMP-2024-005', patient: 'David Kim', test: 'Urinalysis', collected: 'Jan 14, 2:00 PM', status: 'Completed', statusClass: 'bg-green-100 text-green-700' }
    ];
    get filteredSamples() { return this.activeFilter === 'All' ? this.samples : this.samples.filter(s => s.status === this.activeFilter); }
}
