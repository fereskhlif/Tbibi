import { Component } from '@angular/core';

@Component({
    selector: 'app-interaction-history',
    template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Interaction History</h1>
      <p class="text-gray-600 mb-6">Complete history of your healthcare interactions</p>
      <div class="space-y-4">
        <div *ngFor="let item of history" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div [class]="'w-12 h-12 rounded-lg flex items-center justify-center ' + item.bgColor"><span class="text-2xl">{{item.icon}}</span></div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">{{item.title}}</h3>
              <p class="text-sm text-gray-600">{{item.description}}</p>
              <p class="text-xs text-gray-400 mt-1">{{item.date}}</p>
            </div>
            <span [class]="'px-3 py-1 text-xs rounded-full font-medium ' + item.typeClass">{{item.type}}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InteractionHistoryComponent {
    history = [
        { title: 'Teleconsultation with Dr. Sarah Johnson', description: 'Video call consultation regarding cardiac health checkup', date: 'Jan 15, 2024 at 10:00 AM', icon: '📹', bgColor: 'bg-blue-50', type: 'Consultation', typeClass: 'bg-blue-100 text-blue-700' },
        { title: 'Lab Test Completed', description: 'Complete Blood Count results available', date: 'Jan 10, 2024 at 3:00 PM', icon: '🔬', bgColor: 'bg-cyan-50', type: 'Lab Test', typeClass: 'bg-cyan-100 text-cyan-700' },
        { title: 'Prescription Updated', description: 'Amoxicillin 500mg prescribed by Dr. Ahmed Hassan', date: 'Jan 8, 2024 at 11:30 AM', icon: '💊', bgColor: 'bg-orange-50', type: 'Prescription', typeClass: 'bg-orange-100 text-orange-700' },
        { title: 'AI Health Chat', description: 'Symptom analysis - Headache assessment', date: 'Jan 5, 2024 at 2:00 PM', icon: '🤖', bgColor: 'bg-purple-50', type: 'AI Chat', typeClass: 'bg-purple-100 text-purple-700' },
        { title: 'In-Person Visit', description: 'General checkup at Central Hospital', date: 'Dec 28, 2023 at 9:00 AM', icon: '🏥', bgColor: 'bg-green-50', type: 'Visit', typeClass: 'bg-green-100 text-green-700' },
        { title: 'Pharmacy Order', description: 'Ordered Vitamin D3 and Multivitamin', date: 'Dec 20, 2023 at 4:00 PM', icon: '🛍️', bgColor: 'bg-yellow-50', type: 'Pharmacy', typeClass: 'bg-yellow-100 text-yellow-700' },
        { title: 'MRI Scan', description: 'Knee MRI at Imaging Center', date: 'Dec 15, 2023 at 1:00 PM', icon: '📷', bgColor: 'bg-red-50', type: 'Imaging', typeClass: 'bg-red-100 text-red-700' }
    ];
}
