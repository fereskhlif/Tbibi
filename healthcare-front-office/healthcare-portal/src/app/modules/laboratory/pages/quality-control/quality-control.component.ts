import { Component } from '@angular/core';
@Component({
    selector: 'app-quality-control', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Quality Control</h1><p class="text-gray-600 mb-6">Monitor laboratory quality metrics and compliance</p>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-sm text-gray-500 mb-1">{{stat.label}}</p>
        <p class="text-2xl font-bold" [class]="stat.color">{{stat.value}}</p>
        <p class="text-xs text-gray-400 mt-1">Target: {{stat.target}}</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">QC Checks Today</h3>
        <div class="space-y-3">
          <div *ngFor="let check of qcChecks" class="flex items-center justify-between p-3 rounded-lg" [class]="check.pass ? 'bg-green-50' : 'bg-red-50'">
            <div><p class="font-medium text-gray-900">{{check.test}}</p><p class="text-sm text-gray-500">{{check.equipment}} • {{check.time}}</p></div>
            <span [class]="'px-3 py-1 text-xs rounded-full ' + (check.pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')">{{check.pass ? 'Pass' : 'Fail'}}</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Compliance Checklist</h3>
        <div class="space-y-3">
          <div *ngFor="let item of compliance" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span [class]="'w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ' + (item.done ? 'bg-green-500' : 'bg-gray-300')">{{item.done ? '✓' : ''}}</span>
            <div class="flex-1"><p class="text-sm font-medium text-gray-900">{{item.task}}</p><p class="text-xs text-gray-500">{{item.due}}</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class QualityControlComponent {
    stats = [
        { label: 'Accuracy Rate', value: '98.5%', target: '≥95%', color: 'text-green-600' },
        { label: 'QC Pass Rate', value: '96.2%', target: '≥90%', color: 'text-green-600' },
        { label: 'Turnaround Time', value: '4.2h', target: '≤6h', color: 'text-green-600' },
        { label: 'Error Rate', value: '0.3%', target: '≤1%', color: 'text-green-600' }
    ];
    qcChecks = [
        { test: 'Hematology QC', equipment: 'Sysmex XN-1000', time: '8:00 AM', pass: true },
        { test: 'Chemistry QC Level 1', equipment: 'Cobas 6000', time: '8:30 AM', pass: true },
        { test: 'Chemistry QC Level 2', equipment: 'Cobas 6000', time: '8:30 AM', pass: true },
        { test: 'Coagulation QC', equipment: 'Stago STA-R', time: '9:00 AM', pass: false },
        { test: 'Immunoassay QC', equipment: 'Abbott Architect', time: '9:30 AM', pass: true }
    ];
    compliance = [
        { task: 'Daily temperature log', due: 'Due today', done: true },
        { task: 'Equipment calibration check', due: 'Due today', done: true },
        { task: 'Reagent inventory check', due: 'Due today', done: false },
        { task: 'Monthly proficiency test submission', due: 'Due Jan 31', done: false },
        { task: 'Annual staff competency review', due: 'Due Mar 15', done: false }
    ];
}
