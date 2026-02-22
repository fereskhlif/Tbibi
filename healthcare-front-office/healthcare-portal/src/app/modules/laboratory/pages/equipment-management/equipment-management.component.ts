import { Component } from '@angular/core';
@Component({
    selector: 'app-equipment-management', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Equipment Management</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div *ngFor="let eq of equipment" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-3"><span class="text-3xl">{{eq.icon}}</span><div><h3 class="font-semibold text-gray-900">{{eq.name}}</h3><p class="text-sm text-gray-500">{{eq.model}}</p></div></div>
        <span [class]="'px-3 py-1 text-xs rounded-full ' + eq.statusClass">{{eq.status}}</span></div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><span class="text-gray-500">Last Calibration</span><p class="font-medium text-gray-900">{{eq.lastCalibration}}</p></div>
          <div><span class="text-gray-500">Next Maintenance</span><p class="font-medium text-gray-900">{{eq.nextMaintenance}}</p></div>
          <div><span class="text-gray-500">Tests Today</span><p class="font-medium text-gray-900">{{eq.testsToday}}</p></div>
          <div><span class="text-gray-500">Uptime</span><p class="font-medium" [class]="eq.uptime > 95 ? 'text-green-600' : 'text-orange-600'">{{eq.uptime}}%</p></div>
        </div>
      </div>
    </div>
  </div>
` })
export class EquipmentManagementComponent {
    equipment = [
        { name: 'Hematology Analyzer', model: 'Sysmex XN-1000', icon: '🔬', status: 'Online', statusClass: 'bg-green-100 text-green-700', lastCalibration: 'Jan 10, 2024', nextMaintenance: 'Feb 10, 2024', testsToday: 22, uptime: 99.2 },
        { name: 'Chemistry Analyzer', model: 'Roche Cobas 6000', icon: '⚗️', status: 'Online', statusClass: 'bg-green-100 text-green-700', lastCalibration: 'Jan 12, 2024', nextMaintenance: 'Feb 12, 2024', testsToday: 35, uptime: 98.5 },
        { name: 'Coagulation Analyzer', model: 'Stago STA-R', icon: '🧫', status: 'Maintenance', statusClass: 'bg-yellow-100 text-yellow-700', lastCalibration: 'Jan 5, 2024', nextMaintenance: 'Jan 16, 2024', testsToday: 0, uptime: 92.1 },
        { name: 'Immunoassay System', model: 'Abbott Architect', icon: '💉', status: 'Online', statusClass: 'bg-green-100 text-green-700', lastCalibration: 'Jan 14, 2024', nextMaintenance: 'Feb 14, 2024', testsToday: 18, uptime: 99.8 }
    ];
}
