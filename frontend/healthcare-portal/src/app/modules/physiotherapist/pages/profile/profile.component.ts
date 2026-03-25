import { Component } from '@angular/core';
@Component({
    selector: 'app-physio-profile', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Professional Profile</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <div class="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-4xl">🧑‍⚕️</span></div>
        <h2 class="text-xl font-bold text-gray-900">Dr. Marie Laurent</h2><p class="text-purple-600 font-medium">Physiotherapist</p><p class="text-sm text-gray-500 mt-1">12 years experience</p>
        <button class="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Edit Profile</button>
      </div>
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="text-sm text-gray-500">Specialty</label><p class="font-medium">Sports & Orthopedic Rehab</p></div>
          <div><label class="text-sm text-gray-500">License No.</label><p class="font-medium">PT-2024-12345</p></div>
          <div><label class="text-sm text-gray-500">Clinic</label><p class="font-medium">PhysioPlus Rehabilitation</p></div>
          <div><label class="text-sm text-gray-500">Education</label><p class="font-medium">Paris School of Physical Therapy</p></div>
          <div><label class="text-sm text-gray-500">Certifications</label><p class="font-medium">Dry Needling, Manual Therapy</p></div>
          <div><label class="text-sm text-gray-500">Languages</label><p class="font-medium">French, English, Arabic</p></div>
        </div>
      </div>
    </div>
  </div>
` })
export class PhysioProfileComponent { }
