import { Component } from '@angular/core';

@Component({
  selector: 'app-prescriptions',
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold text-gray-900">Prescriptions</h1><p class="text-gray-600">Manage your medications and refills</p></div>
        <button (click)="newRequest()" class="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">+ New Request</button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-6 border-b border-gray-200 mb-6">
        <button *ngFor="let tab of tabs" 
          (click)="activeTab = tab"
          [class]="'pb-3 text-sm font-medium transition-colors relative ' + (activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700')"
        >
          {{tab}}
          <span *ngIf="activeTab === tab" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
        </button>
      </div>

      <div class="space-y-4">
        <div *ngFor="let rx of filteredPrescriptions" class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
            <div class="p-6 flex items-start gap-4 cursor-pointer" (click)="rx.expanded = !rx.expanded">
                <div [class]="'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ' + rx.iconBg">
                     <lucide-icon [name]="rx.icon" class="w-6 h-6 text-gray-700"></lucide-icon>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                        <h3 class="font-bold text-gray-900 text-lg">{{rx.name}}</h3>
                        <span [class]="'px-2.5 py-0.5 text-xs rounded-full font-medium ' + rx.statusClass">{{rx.status}}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">{{rx.dosage}} • {{rx.frequency}}</p>
                    <div class="flex items-center gap-4 text-xs text-gray-500">
                        <span class="flex items-center gap-1"><lucide-icon name="user" class="w-3 h-3"></lucide-icon> {{rx.doctor}}</span>
                        <span class="flex items-center gap-1" *ngIf="rx.refills > 0"><lucide-icon name="refresh-cw" class="w-3 h-3"></lucide-icon> {{rx.refills}} Refills left</span>
                    </div>
                </div>
                <div class="text-gray-400 group-hover:text-blue-600 transition-colors">
                     <lucide-icon name="chevron-down" [class]="'w-5 h-5 transform transition-transform ' + (rx.expanded ? 'rotate-180' : '')"></lucide-icon>
                </div>
            </div>

            <!-- Expanded Actions -->
            <div *ngIf="rx.expanded" class="border-t border-gray-100 bg-gray-50 p-4 flex flex-wrap gap-3 animate-slide-down">
                <button *ngIf="rx.status === 'Active'" (click)="refill(rx)" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Refill Now</button>
                <button (click)="contactDoctor(rx)" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Contact Doctor</button>
                <button (click)="viewDetails(rx)" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">View Details</button>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rotate-180 { transform: rotate(180deg); }
    @keyframes slide-down { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide-down { animation: slide-down 0.2s ease-out; }
  `]
})
export class PrescriptionsComponent {
  activeTab = 'Active';
  tabs = ['Active', 'Completed', 'All'];

  prescriptions = [
    {
      name: 'Amoxicillin', dosage: '500mg', frequency: '3x Daily', doctor: 'Dr. Sarah Johnson', refills: 1,
      status: 'Active', statusClass: 'bg-green-100 text-green-700', icon: 'pill', iconBg: 'bg-blue-50', expanded: false
    },
    {
      name: 'Lisinopril', dosage: '10mg', frequency: '1x Daily', doctor: 'Dr. Michael Chen', refills: 3,
      status: 'Active', statusClass: 'bg-green-100 text-green-700', icon: 'stethoscope', iconBg: 'bg-purple-50', expanded: false
    },
    {
      name: 'Azithromycin', dosage: '250mg', frequency: 'Completed', doctor: 'Dr. Sarah Johnson', refills: 0,
      status: 'Completed', statusClass: 'bg-gray-100 text-gray-600', icon: 'pill', iconBg: 'bg-gray-50', expanded: false
    }
  ];

  get filteredPrescriptions() {
    if (this.activeTab === 'All') return this.prescriptions;
    return this.prescriptions.filter(rx => rx.status === this.activeTab);
  }

  refill(rx: any) {
    alert(`Refill request sent for ${rx.name}. You will be notified when it's ready.`);
  }

  contactDoctor(rx: any) {
    alert(`Message sent to ${rx.doctor} regarding ${rx.name}.`);
  }

  viewDetails(rx: any) {
    alert(`Opening details for ${rx.name}...\nDosage: ${rx.dosage}\nFrequency: ${rx.frequency}\nPharmacy: CVS Pharmacy`);
  }

  newRequest() {
    alert('New prescription request form would open here.');
  }
}
