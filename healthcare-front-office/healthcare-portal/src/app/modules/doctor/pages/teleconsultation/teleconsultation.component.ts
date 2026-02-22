import { Component } from '@angular/core';
@Component({
    selector: 'app-teleconsultation', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Teleconsultation</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <div class="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
          <div class="text-center text-white"><span class="text-6xl block mb-4">📹</span><p class="text-lg">Video Consultation Room</p><p class="text-sm text-gray-400">Waiting for patient to connect...</p></div>
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            <button class="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center">🎤</button>
            <button class="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center">📷</button>
            <button class="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center">📞</button>
            <button class="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center">💬</button>
            <button class="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center">🖥️</button>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Current Patient</h3>
          <div class="flex items-center gap-3 mb-4"><div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><span class="text-xl">👤</span></div><div><p class="font-medium text-gray-900">John Doe</p><p class="text-sm text-gray-500">Age: 34 • Blood: O+</p></div></div>
          <div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-500">Condition</span><span class="text-gray-900">Hypertension</span></div><div class="flex justify-between"><span class="text-gray-500">Last Visit</span><span class="text-gray-900">Jan 15, 2024</span></div><div class="flex justify-between"><span class="text-gray-500">Allergies</span><span class="text-red-600">Penicillin</span></div></div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Upcoming Sessions</h3>
          <div class="space-y-3">
            <div *ngFor="let session of upcomingSessions" class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <span>👤</span><div class="flex-1"><p class="text-sm font-medium text-gray-900">{{session.patient}}</p><p class="text-xs text-gray-500">{{session.time}}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class TeleconsultationComponent {
    upcomingSessions = [
        { patient: 'Jane Smith', time: '11:30 AM' }, { patient: 'Mike Brown', time: '2:00 PM' }, { patient: 'Sarah Wilson', time: '3:30 PM' }
    ];
}
