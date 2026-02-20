import { Component } from '@angular/core';

@Component({
  selector: 'app-doctor-schedules',
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Doctor Schedules</h1>
      <p class="text-gray-600 mb-6">Find and book appointments with available doctors</p>
      <div class="mb-6"><input type="text" [(ngModel)]="searchQuery" class="w-full px-4 py-3 border border-gray-300 rounded-xl" placeholder="Search doctors by name or specialty..." /></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div *ngFor="let doc of filteredDoctors" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center"><span class="text-2xl">{{doc.avatar}}</span></div>
            <div><h3 class="font-semibold text-gray-900">{{doc.name}}</h3><p class="text-sm text-blue-600">{{doc.specialty}}</p></div>
          </div>
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm text-gray-600"><span>📍</span> {{doc.location}}</div>
            <div class="flex items-center gap-2 text-sm text-gray-600"><span>⭐</span> {{doc.rating}} ({{doc.reviews}} reviews)</div>
            <div class="flex items-center gap-2 text-sm text-gray-600"><span>🕐</span> Next: {{doc.nextSlot}}</div>
          </div>
          <div class="flex gap-2">
            <button (click)="bookAppointment(doc)" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">Book Appointment</button>
            <button (click)="viewProfile(doc)" class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">View Profile</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DoctorSchedulesComponent {
  searchQuery = '';
  doctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', location: 'Main Hospital, Floor 3', rating: 4.9, reviews: 128, nextSlot: 'Tomorrow, 10:00 AM', avatar: '👩‍⚕️' },
    { name: 'Dr. Michael Lee', specialty: 'Dermatology', location: 'West Clinic', rating: 4.8, reviews: 95, nextSlot: 'Jan 22, 2:30 PM', avatar: '👨‍⚕️' },
    { name: 'Dr. Ahmed Hassan', specialty: 'General Medicine', location: 'Central Hospital', rating: 4.7, reviews: 210, nextSlot: 'Jan 20, 11:00 AM', avatar: '👨‍⚕️' },
    { name: 'Dr. Lisa Park', specialty: 'Endocrinology', location: 'North Clinic', rating: 4.9, reviews: 87, nextSlot: 'Jan 23, 9:00 AM', avatar: '👩‍⚕️' },
    { name: 'Dr. Robert Chen', specialty: 'Orthopedics', location: 'Sports Medicine Center', rating: 4.8, reviews: 156, nextSlot: 'Jan 21, 3:00 PM', avatar: '👨‍⚕️' },
    { name: 'Dr. Emma Wilson', specialty: 'Pediatrics', location: 'Children Center', rating: 4.9, reviews: 203, nextSlot: 'Jan 24, 10:30 AM', avatar: '👩‍⚕️' }
  ];
  get filteredDoctors() { return this.searchQuery ? this.doctors.filter(d => d.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || d.specialty.toLowerCase().includes(this.searchQuery.toLowerCase())) : this.doctors; }

  bookAppointment(doctor: any) {
    alert(`Booking appointment with ${doctor.name}...`);
  }

  viewProfile(doctor: any) {
    alert(`Viewing profile of ${doctor.name}...`);
  }
}
