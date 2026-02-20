import { Component } from '@angular/core';
@Component({
    selector: 'app-patient-evaluation', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Patient Evaluation</h1><p class="text-gray-600 mb-6">Conduct and review patient assessments</p>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">New Evaluation</h3>
        <div class="space-y-4">
          <div><label class="block text-sm text-gray-700 mb-1">Patient</label><select class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"><option>Select Patient</option><option>John Doe</option><option>Jane Smith</option><option>Sarah Wilson</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">Evaluation Type</label><select class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"><option>Initial Assessment</option><option>Follow-up</option><option>Discharge</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">Pain Assessment (0-10)</label><input type="range" min="0" max="10" [(ngModel)]="painLevel" class="w-full" /><div class="flex justify-between text-xs text-gray-500"><span>No Pain</span><span class="font-bold text-purple-600">{{painLevel}}</span><span>Severe</span></div></div>
          <div><label class="block text-sm text-gray-700 mb-1">Clinical Notes</label><textarea class="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg resize-none" placeholder="Enter clinical observations..."></textarea></div>
          <button class="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Submit Evaluation</button>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Recent Evaluations</h3>
        <div class="space-y-3">
          <div *ngFor="let eval of evaluations" class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-2"><p class="font-medium text-gray-900">{{eval.patient}}</p><span class="text-xs text-gray-500">{{eval.date}}</span></div>
            <p class="text-sm text-gray-600">{{eval.type}} • Pain: {{eval.pain}}/10</p><p class="text-xs text-gray-500 mt-1">{{eval.notes}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class PatientEvaluationComponent {
    painLevel = 5;
    evaluations = [
        { patient: 'John Doe', date: 'Jan 15, 2024', type: 'Follow-up', pain: 3, notes: 'Good progress. ROM improving. Continue current protocol.' },
        { patient: 'Jane Smith', date: 'Jan 14, 2024', type: 'Follow-up', pain: 5, notes: 'Moderate pain during overhead movements. Adjust exercises.' },
        { patient: 'Sarah Wilson', date: 'Jan 12, 2024', type: 'Initial Assessment', pain: 6, notes: 'Chronic lower back pain. Limited flexion. MRI reviewed.' },
        { patient: 'Mike Brown', date: 'Jan 10, 2024', type: 'Initial Assessment', pain: 7, notes: 'Post total knee replacement. Day 5. Starting gentle ROM.' }
    ];
}
