import { Component } from '@angular/core';
@Component({
    selector: 'app-doctor-prescriptions', template: `
  <div class="p-8">
    <div class="flex items-center justify-between mb-6"><div><h1 class="text-2xl font-bold text-gray-900">Prescriptions</h1><p class="text-gray-600">Create and manage patient prescriptions</p></div>
    <button class="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700">+ New Prescription</button></div>
    <div class="space-y-4">
      <div *ngFor="let rx of prescriptions" class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3"><span class="text-2xl">💊</span><div><h3 class="font-semibold text-gray-900">{{rx.patient}}</h3><p class="text-sm text-gray-500">{{rx.date}}</p></div></div>
          <span [class]="'px-3 py-1 text-xs rounded-full ' + rx.statusClass">{{rx.status}}</span>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <div *ngFor="let med of rx.medications" class="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
            <div><p class="font-medium text-gray-900">{{med.name}}</p><p class="text-xs text-gray-500">{{med.dosage}} • {{med.frequency}}</p></div>
            <span class="text-sm text-gray-600">{{med.duration}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class DoctorPrescriptionsComponent {
    prescriptions = [
        { patient: 'John Doe', date: 'Jan 15, 2024', status: 'Active', statusClass: 'bg-green-100 text-green-700', medications: [{ name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', duration: '7 days' }, { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: '5 days' }] },
        { patient: 'Jane Smith', date: 'Jan 12, 2024', status: 'Active', statusClass: 'bg-green-100 text-green-700', medications: [{ name: 'Metformin', dosage: '850mg', frequency: 'Twice daily', duration: '30 days' }] },
        { patient: 'Mike Brown', date: 'Jan 10, 2024', status: 'Completed', statusClass: 'bg-gray-100 text-gray-600', medications: [{ name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '30 days' }, { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '30 days' }] }
    ];
}
