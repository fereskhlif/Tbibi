import { Component } from '@angular/core';

@Component({
  selector: 'app-lab-results',
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold text-gray-900">Lab Results</h1><p class="text-gray-600">View and track your test results</p></div>
        <button (click)="downloadAll()" class="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors">Download All</button>
      </div>

      <div class="space-y-4">
        <div *ngFor="let result of results" class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <!-- Header (Clickable) -->
          <div class="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" (click)="toggleResult(result)">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                 <lucide-icon name="microscope" class="w-6 h-6 text-blue-600"></lucide-icon>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{result.test}}</h3>
                <p class="text-xs text-gray-500">{{result.lab}} • {{result.date}}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span [class]="'px-3 py-1 text-xs rounded-full font-medium ' + result.statusClass">{{result.status}}</span>
              <lucide-icon name="chevron-down" [class]="'w-5 h-5 text-gray-400 transform transition-transform duration-200 ' + (result.expanded ? 'rotate-180' : '')"></lucide-icon>
            </div>
          </div>

          <!-- Expanded Details -->
          <div *ngIf="result.expanded" class="border-t border-gray-100 bg-gray-50/50 p-6 animate-slide-down">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let item of result.items" class="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{item.name}}</p>
                  <p class="text-xs text-gray-500">Range: {{item.range}}</p>
                </div>
                <div class="text-right">
                  <p [class]="'font-bold ' + (item.normal ? 'text-gray-900' : 'text-red-600')">{{item.value}}</p>
                  <p *ngIf="!item.normal" class="text-xs text-red-500 font-medium">Abnormal</p>
                </div>
              </div>
            </div>
            <div class="mt-4 flex justify-end gap-3">
               <button (click)="viewChart(result)" class="text-sm text-blue-600 font-medium hover:underline">View Analysis Chart</button>
               <button (click)="downloadResult(result)" class="text-sm text-gray-600 font-medium hover:text-gray-900">Download PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rotate-180 { transform: rotate(180deg); }
    @keyframes slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide-down { animation: slide-down 0.2s ease-out; }
  `]
})
export class LabResultsComponent {
  results = [
    {
      test: 'Complete Blood Count', lab: 'Central Lab', date: 'Jan 15, 2024', status: 'Completed', statusClass: 'bg-green-100 text-green-700',
      expanded: false,
      items: [{ name: 'Hemoglobin', value: '14.2 g/dL', range: '13.5-17.5', normal: true }, { name: 'WBC', value: '7,500 /μL', range: '4,500-11,000', normal: true }, { name: 'Platelets', value: '250,000 /μL', range: '150,000-400,000', normal: true }, { name: 'RBC', value: '5.1 M/μL', range: '4.5-5.5', normal: true }]
    },
    {
      test: 'Thyroid Panel', lab: 'Endocrine Lab', date: 'Jan 10, 2024', status: 'Completed', statusClass: 'bg-green-100 text-green-700',
      expanded: false,
      items: [{ name: 'TSH', value: '2.5 mIU/L', range: '0.4-4.0', normal: true }, { name: 'Free T4', value: '1.2 ng/dL', range: '0.8-1.8', normal: true }, { name: 'Free T3', value: '3.1 pg/mL', range: '2.3-4.2', normal: true }]
    },
    {
      test: 'Lipid Panel', lab: 'Central Lab', date: 'Dec 28, 2023', status: 'Completed', statusClass: 'bg-green-100 text-green-700',
      expanded: false,
      items: [{ name: 'Total Cholesterol', value: '210 mg/dL', range: '<200', normal: false }, { name: 'HDL', value: '55 mg/dL', range: '>40', normal: true }, { name: 'LDL', value: '130 mg/dL', range: '<100', normal: false }, { name: 'Triglycerides', value: '150 mg/dL', range: '<150', normal: true }]
    }
  ];

  toggleResult(result: any) {
    result.expanded = !result.expanded;
  }

  downloadAll() {
    alert('Downloading all lab results as a ZIP archive...');
  }

  viewChart(result: any) {
    alert(`Generating analysis chart for ${result.test}...`);
  }

  downloadResult(result: any) {
    alert(`Downloading PDF report for ${result.test}...`);
  }
}
