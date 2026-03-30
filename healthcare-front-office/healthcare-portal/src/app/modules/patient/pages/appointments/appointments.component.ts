import { Component } from '@angular/core';

@Component({
  selector: 'app-appointments',
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold text-gray-900">Appointments</h1><p class="text-gray-600">Manage your upcoming and past appointments</p></div>
        <button (click)="showNewAppointmentModal = true" class="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">+ New Appointment</button>
      </div>

       <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 class="text-blue-900 font-semibold mb-2">Upcoming</h3>
          <p class="text-3xl font-bold text-blue-600">{{upcomingCount}}</p>
        </div>
        <div class="bg-purple-50 p-6 rounded-xl border border-purple-100">
          <h3 class="text-purple-900 font-semibold mb-2">Past Interactions</h3>
          <p class="text-3xl font-bold text-purple-600">12</p>
        </div>
        <div class="bg-green-50 p-6 rounded-xl border border-green-100">
          <h3 class="text-green-900 font-semibold mb-2">Next Visit</h3>
          <p class="text-lg font-bold text-green-600" *ngIf="nextVisit">{{nextVisit}}</p>
          <p class="text-lg font-bold text-green-600" *ngIf="!nextVisit">None scheduled</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">Upcoming Appointments</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <div *ngFor="let apt of appointments" class="p-6 hover:bg-gray-50 transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-transparent hover:border-gray-200 rounded-xl">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center text-blue-700">
                <span class="text-xs font-bold uppercase">{{apt.month}}</span>
                <span class="text-xl font-bold">{{apt.day}}</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg">{{apt.title}}</h3>
                <p class="text-gray-600">{{apt.doctor}} • {{apt.specialty}}</p>
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span class="flex items-center gap-1"><lucide-icon name="clock" class="w-4 h-4"></lucide-icon> {{apt.time}}</span>
                  <span class="flex items-center gap-1"><lucide-icon name="map-pin" class="w-4 h-4"></lucide-icon> {{apt.location}}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
               <button (click)="reschedule(apt)" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Reschedule</button>
               <button (click)="viewDetails(apt)" class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">Details</button>
            </div>
          </div>
          <div *ngIf="appointments.length === 0" class="p-8 text-center text-gray-500">
            No upcoming appointments.
          </div>
        </div>
      </div>

       <!-- New Appointment Modal -->
      <div *ngIf="showNewAppointmentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 class="font-bold text-xl text-gray-900">Book New Appointment</h3>
             <button (click)="showNewAppointmentModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          
          <div class="p-6 space-y-4 overflow-y-auto">
             <div>
               <label class="block text-sm font-medium text-gray-700 mb-1">Doctor / Specialty</label>
               <select class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 outline-none">
                 <option>General Physician</option>
                 <option>Cardiologist</option>
                 <option>Dermatologist</option>
               </select>
             </div>
             <div class="grid grid-cols-2 gap-4">
               <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 outline-none">
               </div>
               <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 outline-none">
               </div>
             </div>
             <div>
               <label class="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
               <textarea class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 outline-none h-24" placeholder="Briefly describe your symptoms..."></textarea>
             </div>
          </div>

          <div class="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
             <button (click)="showNewAppointmentModal = false" class="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
             <button (click)="bookAppointment()" class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Book Appointment</button>
          </div>
        </div>
      </div>

    <!-- Appointment Details Modal -->
      <div *ngIf="selectedAppointment" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
           <div class="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 class="font-bold text-xl text-gray-900">Appointment Details</h3>
             <button (click)="selectedAppointment = null" class="text-gray-400 hover:text-gray-600">✕</button>
           </div>
           <div class="p-6 space-y-4">
             <div>
               <p class="text-sm text-gray-500">Doctor</p>
               <p class="font-medium text-gray-900 text-lg">{{selectedAppointment.doctor}}</p>
               <p class="text-blue-600 text-sm">{{selectedAppointment.specialty}}</p>
             </div>
             <div class="grid grid-cols-2 gap-4">
               <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{selectedAppointment.month}} {{selectedAppointment.day}}</p></div>
               <div><p class="text-sm text-gray-500">Time</p><p class="font-medium">{{selectedAppointment.time}}</p></div>
             </div>
             <div>
               <p class="text-sm text-gray-500">Location</p>
               <p class="font-medium">{{selectedAppointment.location}}</p>
             </div>
           </div>
           <div class="p-6 bg-gray-50 border-t border-gray-100">
             <button (click)="selectedAppointment = null" class="w-full px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Close</button>
           </div>
        </div>
      </div>

       <!-- Reschedule Modal -->
       <div *ngIf="showRescheduleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
           <div class="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 class="font-bold text-xl text-gray-900">Reschedule</h3>
             <button (click)="showRescheduleModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
           </div>
           <div class="p-6 space-y-4">
             <p class="text-sm text-gray-600">Select a new date and time for your appointment with <span class="font-semibold text-gray-900">{{rescheduleAppointment?.doctor}}</span>.</p>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                <input type="date" [(ngModel)]="rescheduleDate" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 outline-none">
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                <input type="time" [(ngModel)]="rescheduleTime" class="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 outline-none">
             </div>
           </div>
           <div class="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
             <button (click)="showRescheduleModal = false" class="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
             <button (click)="confirmReschedule()" class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Confirm Change</button>
           </div>
        </div>
      </div>
    </div>
  `
})
export class AppointmentsComponent {
  showNewAppointmentModal = false;

  appointments = [
    {
      title: 'Annual Physical Checkup', doctor: 'Dr. Sarah Johnson', specialty: 'General Practice',
      month: 'FEB', day: '24', time: '10:00 AM', location: 'Medical Center, Room 302'
    },
    {
      title: 'Cardiology Follow-up', doctor: 'Dr. Michael Chen', specialty: 'Cardiology',
      month: 'MAR', day: '10', time: '02:30 PM', location: 'Heart & Vascular Institute'
    }
  ];

  selectedAppointment: any = null;
  rescheduleAppointment: any = null;
  showRescheduleModal = false;
  rescheduleDate = '';
  rescheduleTime = '';

  get upcomingCount() { return this.appointments.length; }

  get nextVisit() {
    if (this.appointments.length === 0) return null;
    const next = this.appointments[0];
    return `${next.month} ${next.day}`;
  }

  bookAppointment() {
    this.showNewAppointmentModal = false;
    alert('Appointment request sent successfully!');
  }

  reschedule(apt: any) {
    this.rescheduleAppointment = apt;
    this.showRescheduleModal = true;
  }

  confirmReschedule() {
    if (!this.rescheduleDate || !this.rescheduleTime) {
      alert('Please select a new date and time.');
      return;
    }
    this.showRescheduleModal = false;
    alert(`Appointment for ${this.rescheduleAppointment.title} rescheduled to ${this.rescheduleDate} at ${this.rescheduleTime}.`);
    this.rescheduleAppointment = null;
    this.rescheduleDate = '';
    this.rescheduleTime = '';
  }

  viewDetails(apt: any) {
    this.selectedAppointment = apt;
  }
}
