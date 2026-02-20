import { Component } from '@angular/core';

@Component({
  selector: 'app-reminders',
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold text-gray-900">Reminders</h1><p class="text-gray-600">Stay on top of your health tasks</p></div>
        <button (click)="showModal = true" class="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">+ Add Reminder</button>
      </div>
      <div class="space-y-4">
        <div *ngFor="let reminder of reminders; let i = index" class="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div [class]="'w-12 h-12 rounded-lg flex items-center justify-center ' + reminder.bgColor"><span class="text-2xl">{{reminder.icon}}</span></div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{reminder.title}}</h3>
            <p class="text-sm text-gray-600">{{reminder.description}}</p>
            <p class="text-xs text-gray-400 mt-1">{{reminder.time}}</p>
          </div>
          <div class="flex items-center gap-2">
            <span [class]="'px-3 py-1 text-xs rounded-full font-medium ' + reminder.priorityClass">{{reminder.priority}}</span>
            <button (click)="reminders.splice(i, 1)" class="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">✕</button>
          </div>
        </div>
      </div>

      <!-- Add Reminder Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="showModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-900">Add New Reminder</h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" [(ngModel)]="newReminder.title" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g., Take medication">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time/Frequency</label>
              <input type="text" [(ngModel)]="newReminder.time" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g., Daily at 9 AM">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select [(ngModel)]="newReminder.priority" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <button (click)="addReminder()" class="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors mt-2">Add Reminder</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RemindersComponent {
  showModal = false;
  newReminder = { title: '', time: '', priority: 'Medium' };

  reminders = [
    { title: 'Take Amoxicillin', description: 'Take 1 capsule with food', time: 'Every 8 hours • Next: 2:00 PM', icon: '💊', bgColor: 'bg-orange-50', priority: 'High', priorityClass: 'bg-red-100 text-red-700' },
    { title: 'Appointment Reminder', description: 'Video call with Dr. Sarah Johnson', time: 'Tomorrow at 10:00 AM', icon: '📅', bgColor: 'bg-blue-50', priority: 'Medium', priorityClass: 'bg-yellow-100 text-yellow-700' },
    { title: 'Blood Pressure Check', description: 'Measure and record your blood pressure', time: 'Daily at 9:00 AM', icon: '🩺', bgColor: 'bg-red-50', priority: 'High', priorityClass: 'bg-red-100 text-red-700' },
    { title: 'Lab Results Follow-up', description: 'Discuss lipid panel results with doctor', time: 'Jan 25, 2024', icon: '🔬', bgColor: 'bg-cyan-50', priority: 'Medium', priorityClass: 'bg-yellow-100 text-yellow-700' },
    { title: 'Prescription Refill', description: 'Ibuprofen refill - 1 remaining', time: 'Before Jan 20, 2024', icon: '🔄', bgColor: 'bg-green-50', priority: 'Low', priorityClass: 'bg-green-100 text-green-700' }
  ];

  addReminder() {
    const priorityClass = this.newReminder.priority === 'High' ? 'bg-red-100 text-red-700' :
      this.newReminder.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

    this.reminders.unshift({
      title: this.newReminder.title,
      description: 'User added reminder',
      time: this.newReminder.time,
      icon: '🔔',
      bgColor: 'bg-purple-50',
      priority: this.newReminder.priority,
      priorityClass: priorityClass
    });
    this.showModal = false;
    this.newReminder = { title: '', time: '', priority: 'Medium' };
  }
}
