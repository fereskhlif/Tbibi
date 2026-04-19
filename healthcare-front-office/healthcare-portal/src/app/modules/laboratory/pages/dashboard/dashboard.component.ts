import { Component } from '@angular/core';
@Component({
    selector: 'app-lab-dashboard', template: `
  <div class="p-8">
    <div class="mb-8"><h1 class="text-2xl font-bold text-gray-900 mb-2">Laboratory Dashboard</h1><p class="text-gray-600">Welcome back, Laboratory Admin</p></div>
    
    <!-- Quick Links Section -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a *ngFor="let link of quickLinks" [routerLink]="link.route" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-3xl">{{link.icon}}</span>
            <h3 class="font-semibold text-gray-900 group-hover:text-blue-600">{{link.title}}</h3>
          </div>
          <p class="text-sm text-gray-500">{{link.description}}</p>
        </a>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-3 mb-3"><span class="text-2xl">{{stat.icon}}</span><span class="text-sm text-gray-500">{{stat.title}}</span></div>
        <p class="text-xl font-bold text-gray-900">{{stat.value}}</p><p class="text-sm text-gray-500 mt-1">{{stat.subtitle}}</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Pending Tests</h3>
        <div class="space-y-3">
          <div *ngFor="let test of pendingTests" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span class="text-xl">🔬</span><div class="flex-1"><p class="font-medium text-gray-900">{{test.test}}</p><p class="text-sm text-gray-500">Patient: {{test.patient}} • Dr. {{test.doctor}}</p></div>
            <span [class]="'px-2 py-1 text-xs rounded-full ' + test.priorityClass">{{test.priority}}</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Equipment Status</h3>
        <div class="space-y-3">
          <div *ngFor="let eq of equipment" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3"><span class="text-xl">{{eq.icon}}</span><p class="font-medium text-gray-900">{{eq.name}}</p></div>
            <span [class]="'px-2 py-1 text-xs rounded-full ' + eq.statusClass">{{eq.status}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class LabDashboardComponent {
    stats = [
        { icon: '🧪', title: 'Tests Today', value: '45', subtitle: '28 completed' },
        { icon: '📦', title: 'Pending Samples', value: '12', subtitle: '3 urgent' },
        { icon: '📊', title: 'Avg Turnaround', value: '4.2h', subtitle: 'Target: 6h' },
        { icon: '✅', title: 'Quality Score', value: '98.5%', subtitle: 'Above target' }
    ];
    
    quickLinks = [
        { title: 'Lab Results', route: '/laboratory/lab-results', icon: '🧪', description: 'Manage laboratory test results' },
        { title: 'Medical Pictures', route: '/laboratory/medical-pictures', icon: '🖼️', description: 'View and analyze medical images' },
        { title: 'Statistics', route: '/laboratory/statistics', icon: '📊', description: 'View patient test statistics' }
    ];
    
    pendingTests = [
        { test: 'Complete Blood Count', patient: 'John Doe', doctor: 'Sarah Johnson', priority: 'Urgent', priorityClass: 'bg-red-100 text-red-700' },
        { test: 'Lipid Panel', patient: 'Jane Smith', doctor: 'Ahmed Hassan', priority: 'Routine', priorityClass: 'bg-blue-100 text-blue-700' },
        { test: 'Thyroid Panel', patient: 'Mike Brown', doctor: 'Lisa Park', priority: 'Routine', priorityClass: 'bg-blue-100 text-blue-700' }
    ];
    equipment = [
        { name: 'Hematology Analyzer', icon: '🔬', status: 'Online', statusClass: 'bg-green-100 text-green-700' },
        { name: 'Chemistry Analyzer', icon: '⚗️', status: 'Online', statusClass: 'bg-green-100 text-green-700' },
        { name: 'Coagulation Analyzer', icon: '🧫', status: 'Maintenance', statusClass: 'bg-yellow-100 text-yellow-700' },
        { name: 'Immunoassay System', icon: '💉', status: 'Online', statusClass: 'bg-green-100 text-green-700' }
    ];
}
