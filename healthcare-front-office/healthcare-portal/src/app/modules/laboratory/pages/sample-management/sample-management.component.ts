import { Component } from '@angular/core';
@Component({
  selector: 'app-sample-management',
  template: `
  <div class="min-h-screen bg-gray-50 p-6 lg:p-8">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div class="flex items-center gap-4">
        <div
          style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9,#6366f1);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(99,102,241,.35);flex-shrink:0;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="white"
            style="width:26px;height:26px;">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">Sample Management</h1>
          <p class="text-sm text-gray-500 mt-0.5">Track and manage laboratory samples</p>
        </div>
      </div>
      <button class="px-5 py-2.5 text-white rounded-xl font-bold text-sm transition-all shadow-lg"
        style="background:linear-gradient(135deg,#0ea5e9,#6366f1);">
        + Register Sample
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div (click)="activeFilter = 'All'"
        class="bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg"
        [style.border-color]="activeFilter === 'All' ? '#6366f1' : '#f1f5f9'"
        [style.background]="activeFilter === 'All' ? '#f5f3ff' : 'white'">
        <div class="flex items-center justify-between mb-2">
          <span class="text-2xl">📦</span>
          <span class="text-3xl font-black text-indigo-600">{{samples.length}}</span>
        </div>
        <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Samples</p>
      </div>

      <div (click)="activeFilter = 'Received'"
        class="bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg"
        [style.border-color]="activeFilter === 'Received' ? '#f59e0b' : '#f1f5f9'"
        [style.background]="activeFilter === 'Received' ? '#fffbeb' : 'white'">
        <div class="flex items-center justify-between mb-2">
          <span class="text-2xl">📥</span>
          <span class="text-3xl font-black text-amber-600">{{countByStatus('Received')}}</span>
        </div>
        <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Received</p>
      </div>

      <div (click)="activeFilter = 'Processing'"
        class="bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg"
        [style.border-color]="activeFilter === 'Processing' ? '#3b82f6' : '#f1f5f9'"
        [style.background]="activeFilter === 'Processing' ? '#eff6ff' : 'white'">
        <div class="flex items-center justify-between mb-2">
          <span class="text-2xl">🧪</span>
          <span class="text-3xl font-black text-blue-600">{{countByStatus('Processing')}}</span>
        </div>
        <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Processing</p>
      </div>

      <div (click)="activeFilter = 'Completed'"
        class="bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg"
        [style.border-color]="activeFilter === 'Completed' ? '#10b981' : '#f1f5f9'"
        [style.background]="activeFilter === 'Completed' ? '#f0fdf4' : 'white'">
        <div class="flex items-center justify-between mb-2">
          <span class="text-2xl">✅</span>
          <span class="text-3xl font-black text-emerald-600">{{countByStatus('Completed')}}</span>
        </div>
        <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Completed</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 mb-6">
      <button *ngFor="let f of filters" (click)="activeFilter = f"
        class="px-5 py-2 rounded-full text-xs font-bold transition-all"
        [class]="activeFilter === f ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-50'">
        {{f}}
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Sample ID</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Test Type</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Collection Date</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let s of filteredSamples" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-6 py-4 font-mono text-xs font-bold text-blue-600">{{s.id}}</td>
            <td class="px-6 py-4 text-sm font-bold text-gray-900">{{s.patient}}</td>
            <td class="px-6 py-4">
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-wider">{{s.test}}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{s.collected}}</td>
            <td class="px-6 py-4">
              <span [class]="'px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ' + s.statusClass">{{s.status}}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
`
})
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

  countByStatus(status: string): number {
    return this.samples.filter(s => s.status === status).length;
  }

  get filteredSamples() {
    return this.activeFilter === 'All' ? this.samples : this.samples.filter(s => s.status === this.activeFilter);
  }
}

