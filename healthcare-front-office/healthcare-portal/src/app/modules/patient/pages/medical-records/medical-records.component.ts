import { Component } from '@angular/core';

@Component({
  selector: 'app-medical-records',
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p class="text-gray-600">View and manage your health records</p>
        </div>
        <div class="flex gap-3">
          <button (click)="openAddModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <span>+</span> Add New Record
          </button>
          <button class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Download All</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 mb-6 flex-wrap">
        <button *ngFor="let f of filters" (click)="activeFilter = f"
          [class]="'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (activeFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50')">
          {{f}}
        </button>
      </div>

      <!-- Records List -->
      <div class="space-y-4">
        <div *ngFor="let record of filteredRecords; let i = index" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div (click)="viewRecord(record)" class="flex items-center gap-4 cursor-pointer flex-1">
              <div [class]="'w-12 h-12 rounded-lg flex items-center justify-center ' + record.bgColor">
                <span class="text-2xl">{{record.icon}}</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{record.title}}</h3>
                <p class="text-sm text-gray-600">{{record.doctor}} • {{record.date}}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span [class]="'px-3 py-1 text-xs rounded-full font-medium ' + record.statusClass">{{record.status}}</span>
              <div class="flex gap-1">
                <button (click)="viewRecord(record)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                   <span class="text-lg">👁️</span>
                </button>
                <button (click)="openEditModal(record, i)" class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                   <span class="text-lg">✏️</span>
                </button>
                <button (click)="deleteRecord(i)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                   <span class="text-lg">🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Record Details Modal -->
      <div *ngIf="selectedRecord && !isCRUDModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
           <div class="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 class="font-bold text-xl text-gray-900">Record Details</h3>
             <button (click)="selectedRecord = null" class="text-gray-400 hover:text-gray-600">✕</button>
           </div>
           <div class="p-6 space-y-4">
             <div class="flex items-center gap-4 mb-4">
               <div [class]="'w-16 h-16 rounded-xl flex items-center justify-center text-3xl ' + selectedRecord.bgColor">{{selectedRecord.icon}}</div>
               <div>
                  <h4 class="text-lg font-bold text-gray-900">{{selectedRecord.title}}</h4>
                  <p class="text-gray-500">{{selectedRecord.type}}</p>
               </div>
             </div>
             
             <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 p-3 rounded-lg">
                   <p class="text-xs text-gray-500 uppercase font-semibold">Doctor</p>
                   <p class="font-medium text-gray-900">{{selectedRecord.doctor}}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                   <p class="text-xs text-gray-500 uppercase font-semibold">Date</p>
                   <p class="font-medium text-gray-900">{{selectedRecord.date}}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                   <p class="text-xs text-gray-500 uppercase font-semibold">Status</p>
                   <p [class]="'font-medium ' + (selectedRecord.statusClass?.includes('text-green-700') ? 'text-green-600' : 'text-blue-600')">{{selectedRecord.status}}</p>
                </div>
             </div>

             <div class="mt-4">
               <p class="font-semibold text-gray-900 mb-2">Summary/Result</p>
               <p class="text-gray-600 text-sm leading-relaxed">
                 Patient presented with standard symptoms. All vital signs are within normal limits. 
                 Specific findings for {{selectedRecord.title}} indicate no anomalies. 
                 Recommended follow-up in 2 weeks if symptoms persist.
               </p>
             </div>
           </div>
           <div class="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
             <button class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Download PDF</button>
             <button (click)="selectedRecord = null" class="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Close</button>
           </div>
        </div>
      </div>

      <!-- Add/Edit Record Modal -->
      <div *ngIf="isCRUDModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 class="font-bold text-xl text-gray-900">{{modalMode === 'add' ? 'Add New Record' : 'Edit Medical Record'}}</h3>
            <button (click)="closeCRUDModal()" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Record Title</label>
              <input type="text" [(ngModel)]="tempRecord.title" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Blood Test, MRI Scan">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                <input type="text" [(ngModel)]="tempRecord.doctor" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Dr. Smith">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="text" [(ngModel)]="tempRecord.date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Jan 15, 2024">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                <select [(ngModel)]="tempRecord.type" (change)="updateIconAndColor()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option *ngFor="let f of filters.slice(1)" [value]="f">{{f}}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select [(ngModel)]="tempRecord.status" (change)="updateStatusClass()" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="Completed">Completed</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div class="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button (click)="closeCRUDModal()" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button (click)="saveRecord()" class="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              {{modalMode === 'add' ? 'Create Record' : 'Save Changes'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MedicalRecordsComponent {
  activeFilter = 'All';
  filters = ['All', 'Lab Reports', 'Prescriptions', 'Imaging', 'Consultations'];

  records = [
    { title: 'Complete Blood Count', doctor: 'Dr. Sarah Johnson', date: 'Jan 15, 2024', icon: '🔬', bgColor: 'bg-blue-50', status: 'Completed', statusClass: 'bg-green-100 text-green-700', type: 'Lab Reports' },
    { title: 'Chest X-Ray', doctor: 'Dr. Michael Lee', date: 'Jan 10, 2024', icon: '📷', bgColor: 'bg-purple-50', status: 'Completed', statusClass: 'bg-green-100 text-green-700', type: 'Imaging' },
    { title: 'Prescription Renewal', doctor: 'Dr. Ahmed Hassan', date: 'Jan 8, 2024', icon: '💊', bgColor: 'bg-orange-50', status: 'Active', statusClass: 'bg-blue-100 text-blue-700', type: 'Prescriptions' },
    { title: 'General Consultation', doctor: 'Dr. Sarah Johnson', date: 'Jan 5, 2024', icon: '👨‍⚕️', bgColor: 'bg-green-50', status: 'Completed', statusClass: 'bg-green-100 text-green-700', type: 'Consultations' },
    { title: 'Thyroid Panel', doctor: 'Dr. Lisa Park', date: 'Dec 28, 2023', icon: '🔬', bgColor: 'bg-blue-50', status: 'Completed', statusClass: 'bg-green-100 text-green-700', type: 'Lab Reports' },
    { title: 'MRI Scan - Knee', doctor: 'Dr. Robert Chen', date: 'Dec 20, 2023', icon: '📷', bgColor: 'bg-purple-50', status: 'Completed', statusClass: 'bg-green-100 text-green-700', type: 'Imaging' }
  ];

  selectedRecord: any = null;
  
  // CRUD state
  isCRUDModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  editingRecordIndex = -1;
  tempRecord: any = {
    title: '',
    doctor: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    type: 'Lab Reports',
    status: 'Completed',
    icon: '🔬',
    bgColor: 'bg-blue-50',
    statusClass: 'bg-green-100 text-green-700'
  };

  get filteredRecords() {
    if (this.activeFilter === 'All') return this.records;
    return this.records.filter(r => r.type === this.activeFilter);
  }

  viewRecord(record: any) {
    this.selectedRecord = record;
  }

  // CRUD Methods
  openAddModal() {
    this.modalMode = 'add';
    this.tempRecord = {
      title: '',
      doctor: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: 'Lab Reports',
      status: 'Completed',
      icon: '🔬',
      bgColor: 'bg-blue-50',
      statusClass: 'bg-green-100 text-green-700'
    };
    this.isCRUDModalOpen = true;
  }

  openEditModal(record: any, index: number) {
    this.modalMode = 'edit';
    this.editingRecordIndex = this.records.indexOf(record);
    this.tempRecord = { ...record };
    this.isCRUDModalOpen = true;
  }

  closeCRUDModal() {
    this.isCRUDModalOpen = false;
  }

  saveRecord() {
    if (this.modalMode === 'add') {
      this.records.unshift({ ...this.tempRecord });
    } else {
      this.records[this.editingRecordIndex] = { ...this.tempRecord };
    }
    this.closeCRUDModal();
  }

  deleteRecord(index: number) {
    const record = this.filteredRecords[index];
    const realIndex = this.records.indexOf(record);
    if (confirm('Are you sure you want to delete this medical record?')) {
      this.records.splice(realIndex, 1);
    }
  }

  updateIconAndColor() {
    const config: any = {
      'Lab Reports': { icon: '🔬', bgColor: 'bg-blue-50' },
      'Imaging': { icon: '📷', bgColor: 'bg-purple-50' },
      'Prescriptions': { icon: '💊', bgColor: 'bg-orange-50' },
      'Consultations': { icon: '👨‍⚕️', bgColor: 'bg-green-50' }
    };
    this.tempRecord.icon = config[this.tempRecord.type].icon;
    this.tempRecord.bgColor = config[this.tempRecord.type].bgColor;
  }

  updateStatusClass() {
    if (this.tempRecord.status === 'Completed') {
      this.tempRecord.statusClass = 'bg-green-100 text-green-700';
    } else if (this.tempRecord.status === 'Active') {
      this.tempRecord.statusClass = 'bg-blue-100 text-blue-700';
    } else {
      this.tempRecord.statusClass = 'bg-gray-100 text-gray-700';
    }
  }
}
