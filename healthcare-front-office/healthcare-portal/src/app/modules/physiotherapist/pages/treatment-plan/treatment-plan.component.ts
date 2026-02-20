import { Component } from '@angular/core';
@Component({
    selector: 'app-treatment-plan', template: `
  <div class="p-8">
    <div class="flex items-center justify-between mb-6"><div><h1 class="text-2xl font-bold text-gray-900">Treatment Plans</h1><p class="text-gray-600">Create and manage treatment protocols</p></div>
    <button class="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700">+ New Plan</button></div>
    <div class="space-y-4">
      <div *ngFor="let plan of plans" class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4"><div><h3 class="font-semibold text-gray-900">{{plan.patient}} - {{plan.condition}}</h3><p class="text-sm text-gray-500">Created: {{plan.created}} • Duration: {{plan.duration}}</p></div>
        <span [class]="'px-3 py-1 text-xs rounded-full ' + plan.statusClass">{{plan.status}}</span></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div *ngFor="let phase of plan.phases" class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2"><span [class]="'w-2 h-2 rounded-full ' + phase.dotClass"></span><h4 class="font-medium text-gray-900 text-sm">{{phase.name}}</h4></div>
            <p class="text-xs text-gray-600">{{phase.description}}</p><p class="text-xs text-gray-400 mt-1">{{phase.weeks}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class TreatmentPlanComponent {
    plans = [
        {
            patient: 'John Doe', condition: 'ACL Reconstruction', created: 'Dec 1, 2023', duration: '16 weeks', status: 'Active', statusClass: 'bg-green-100 text-green-700',
            phases: [{ name: 'Phase 1: Protection', description: 'ROM exercises, pain management, swelling control', weeks: 'Weeks 1-4', dotClass: 'bg-green-500' }, { name: 'Phase 2: Strengthening', description: 'Progressive resistance, balance training', weeks: 'Weeks 5-10', dotClass: 'bg-blue-500' }, { name: 'Phase 3: Function', description: 'Sport-specific exercises, agility drills', weeks: 'Weeks 11-14', dotClass: 'bg-purple-500' }, { name: 'Phase 4: Return', description: 'Full activity return, maintenance program', weeks: 'Weeks 15-16', dotClass: 'bg-orange-500' }]
        },
        {
            patient: 'Jane Smith', condition: 'Rotator Cuff Repair', created: 'Dec 15, 2023', duration: '15 weeks', status: 'Active', statusClass: 'bg-green-100 text-green-700',
            phases: [{ name: 'Phase 1: Immobilization', description: 'Passive ROM, pendulum exercises', weeks: 'Weeks 1-6', dotClass: 'bg-green-500' }, { name: 'Phase 2: Active ROM', description: 'Gentle active motion, isometric exercises', weeks: 'Weeks 7-12', dotClass: 'bg-blue-500' }]
        }
    ];
}
