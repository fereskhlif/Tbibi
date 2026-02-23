import { Component } from '@angular/core';
@Component({
    selector: 'app-doctor-profile', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Professional Profile</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <div class="w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-4xl">👩‍⚕️</span></div>
        <h2 class="text-xl font-bold text-gray-900">Dr. Sarah Johnson</h2>
        <p class="text-green-600 font-medium mt-1">Cardiology</p>
        <p class="text-sm text-gray-500 mt-1">15 years experience</p>
        <div class="flex items-center justify-center gap-1 mt-2"><span>⭐</span><span class="font-medium">4.9</span><span class="text-gray-500 text-sm">(128 reviews)</span></div>
        <button class="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Edit Profile</button>
      </div>
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-sm text-gray-500">Specialty</label><p class="font-medium">Cardiology</p></div>
            <div><label class="text-sm text-gray-500">License No.</label><p class="font-medium">MD-2024-56789</p></div>
            <div><label class="text-sm text-gray-500">Hospital</label><p class="font-medium">Central Hospital</p></div>
            <div><label class="text-sm text-gray-500">Department</label><p class="font-medium">Cardiovascular Medicine</p></div>
            <div><label class="text-sm text-gray-500">Education</label><p class="font-medium">Harvard Medical School</p></div>
            <div><label class="text-sm text-gray-500">Languages</label><p class="font-medium">English, French, Arabic</p></div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div *ngFor="let day of availability" [class]="'p-3 rounded-lg text-center ' + (day.available ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200')">
              <p class="font-medium" [class]="day.available ? 'text-green-700' : 'text-gray-400'">{{day.day}}</p>
              <p class="text-xs" [class]="day.available ? 'text-green-600' : 'text-gray-400'">{{day.hours}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class DoctorProfileComponent {
    availability = [
        { day: 'Monday', hours: '9AM - 5PM', available: true }, { day: 'Tuesday', hours: '9AM - 5PM', available: true },
        { day: 'Wednesday', hours: '9AM - 1PM', available: true }, { day: 'Thursday', hours: '9AM - 5PM', available: true },
        { day: 'Friday', hours: '9AM - 3PM', available: true }, { day: 'Saturday', hours: 'Off', available: false }
    ];
}
