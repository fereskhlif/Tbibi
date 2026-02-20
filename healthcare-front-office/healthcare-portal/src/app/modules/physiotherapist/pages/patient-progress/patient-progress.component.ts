import { Component } from '@angular/core';
@Component({
    selector: 'app-patient-progress', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Patient Progress</h1>
    <div class="space-y-6">
      <div *ngFor="let p of patients" class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3"><div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><span>👤</span></div><div><h3 class="font-semibold text-gray-900">{{p.name}}</h3><p class="text-sm text-gray-500">{{p.condition}}</p></div></div>
          <span [class]="'px-3 py-1 text-xs rounded-full ' + p.trendClass">{{p.trend}}</span>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div *ngFor="let m of p.metrics" class="bg-gray-50 rounded-lg p-3 text-center"><p class="text-xs text-gray-500">{{m.label}}</p><p class="text-lg font-bold text-gray-900">{{m.value}}</p></div>
        </div>
        <div class="space-y-1"><div class="flex justify-between text-sm"><span class="text-gray-500">Overall Recovery</span><span class="font-medium text-purple-600">{{p.recovery}}%</span></div>
        <div class="w-full bg-gray-200 rounded-full h-3"><div class="bg-purple-500 h-3 rounded-full transition-all" [style.width.%]="p.recovery"></div></div></div>
      </div>
    </div>
  </div>
` })
export class PatientProgressComponent {
    patients = [
        { name: 'John Doe', condition: 'ACL Reconstruction Recovery', recovery: 75, trend: '↑ Improving', trendClass: 'bg-green-100 text-green-700', metrics: [{ label: 'Sessions Done', value: '12/16' }, { label: 'Pain Level', value: '3/10' }, { label: 'ROM', value: '120°' }] },
        { name: 'Jane Smith', condition: 'Rotator Cuff Repair', recovery: 60, trend: '↑ Improving', trendClass: 'bg-green-100 text-green-700', metrics: [{ label: 'Sessions Done', value: '8/15' }, { label: 'Pain Level', value: '5/10' }, { label: 'ROM', value: '90°' }] },
        { name: 'Sarah Wilson', condition: 'Chronic Lower Back Pain', recovery: 45, trend: '→ Stable', trendClass: 'bg-yellow-100 text-yellow-700', metrics: [{ label: 'Sessions Done', value: '6/20' }, { label: 'Pain Level', value: '6/10' }, { label: 'Flexibility', value: '65%' }] },
        { name: 'Mike Brown', condition: 'Total Knee Replacement', recovery: 30, trend: '↑ Improving', trendClass: 'bg-green-100 text-green-700', metrics: [{ label: 'Sessions Done', value: '4/18' }, { label: 'Pain Level', value: '7/10' }, { label: 'ROM', value: '75°' }] }
    ];
}
