import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-profile',
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div class="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-4xl">👤</span>
          </div>
          <h2 class="text-xl font-bold text-gray-900">John Doe</h2>
          <p class="text-gray-500 mt-1">Patient</p>
          <p class="text-sm text-gray-500 mt-1">Member since Jan 2024</p>
          <button (click)="editProfile()" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Edit Profile</button>
        </div>

        <!-- Personal Info -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let field of personalInfo">
              <label class="block text-sm text-gray-500 mb-1">{{field.label}}</label>
              <input [type]="field.type || 'text'" [value]="field.value" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50" readonly />
            </div>
          </div>
        </div>

        <!-- Medical Info -->
        <div class="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div *ngFor="let field of medicalInfo">
              <label class="block text-sm text-gray-500 mb-1">{{field.label}}</label>
              <p class="text-gray-900 font-medium">{{field.value}}</p>
            </div>
          </div>
        </div>

        <!-- Emergency Contact -->
        <div class="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label class="block text-sm text-gray-500 mb-1">Name</label><p class="text-gray-900">Jane Doe</p></div>
            <div><label class="block text-sm text-gray-500 mb-1">Relationship</label><p class="text-gray-900">Spouse</p></div>
            <div><label class="block text-sm text-gray-500 mb-1">Phone</label><p class="text-gray-900">+1 (555) 987-6543</p></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  personalInfo = [
    { label: 'Full Name', value: 'John Doe' },
    { label: 'Email', value: 'john.doe@example.com', type: 'email' },
    { label: 'Phone', value: '+1 (555) 123-4567', type: 'tel' },
    { label: 'Date of Birth', value: '1990-01-15', type: 'date' },
    { label: 'Gender', value: 'Male' },
    { label: 'Address', value: '123 Main St, New York, NY 10001' }
  ];

  medicalInfo = [
    { label: 'Blood Type', value: 'O+' },
    { label: 'Allergies', value: 'Penicillin, Peanuts' },
    { label: 'Chronic Conditions', value: 'None' },
    { label: 'Current Medications', value: 'Vitamin D, Multivitamin' },
    { label: 'Insurance Provider', value: 'Blue Cross Blue Shield' },
    { label: 'Insurance ID', value: 'BCBS-12345-67890' }
  ];

  editProfile() {
    alert('Edit profile functionality is currently simulated. In a real app, this would enable form editing.');
  }
}
