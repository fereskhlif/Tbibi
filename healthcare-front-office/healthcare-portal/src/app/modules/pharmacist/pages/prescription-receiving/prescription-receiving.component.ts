import { Component } from '@angular/core';
@Component({
    selector: 'app-prescription-receiving', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Prescription Receiving</h1><p class="text-gray-600 mb-6">Receive and process incoming prescriptions</p>
    <div class="space-y-4">
      <div *ngFor="let rx of prescriptions" class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-3"><div class="flex items-center gap-3"><span class="text-2xl">📋</span><div><h3 class="font-semibold text-gray-900">Rx #{{rx.id}}</h3><p class="text-sm text-gray-500">Dr. {{rx.doctor}} → {{rx.patient}}</p></div></div>
        <span [class]="'px-3 py-1 text-xs rounded-full ' + rx.statusClass">{{rx.status}}</span></div>
        <div class="bg-gray-50 rounded-lg p-3"><div *ngFor="let med of rx.medications" class="flex justify-between py-1 text-sm"><span>{{med.name}} - {{med.dosage}}</span><span class="text-gray-500">{{med.qty}}</span></div></div>
        <div class="flex gap-2 mt-4" *ngIf="rx.status === 'New'"><button class="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">Process</button><button class="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">View Details</button></div>
      </div>
    </div>
  </div>
` })
export class PrescriptionReceivingComponent {
    prescriptions = [
        { id: 'RX-2024-101', doctor: 'Sarah Johnson', patient: 'John Doe', status: 'New', statusClass: 'bg-blue-100 text-blue-700', medications: [{ name: 'Amoxicillin', dosage: '500mg', qty: '21 capsules' }, { name: 'Ibuprofen', dosage: '400mg', qty: '30 tablets' }] },
        { id: 'RX-2024-102', doctor: 'Ahmed Hassan', patient: 'Jane Smith', status: 'New', statusClass: 'bg-blue-100 text-blue-700', medications: [{ name: 'Metformin', dosage: '850mg', qty: '60 tablets' }] },
        { id: 'RX-2024-100', doctor: 'Lisa Park', patient: 'Mike Brown', status: 'Processed', statusClass: 'bg-green-100 text-green-700', medications: [{ name: 'Atorvastatin', dosage: '20mg', qty: '30 tablets' }] }
    ];
}
