import { Component } from '@angular/core';
@Component({
    selector: 'app-disease-detection', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Disease Detection</h1><p class="text-gray-600 mb-6">AI-powered disease detection and symptom analysis</p>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Symptom Input</h3>
        <textarea [(ngModel)]="symptoms" class="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl resize-none" placeholder="Enter patient symptoms..."></textarea>
        <div class="mt-4 flex gap-2 flex-wrap">
          <span *ngFor="let tag of symptomTags" class="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full cursor-pointer hover:bg-blue-100" (click)="addSymptom(tag)">+ {{tag}}</span>
        </div>
        <button class="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full">Analyze Symptoms</button>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Detection Results</h3>
        <div class="space-y-4">
          <div *ngFor="let result of results" class="p-4 rounded-lg" [class]="result.bgClass">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{result.disease}}</h4>
              <span [class]="'px-2 py-1 text-xs rounded-full font-medium ' + result.confidenceClass">{{result.confidence}}% match</span>
            </div>
            <p class="text-sm text-gray-600">{{result.description}}</p>
            <div class="mt-2 w-full bg-gray-200 rounded-full h-2"><div [class]="'h-2 rounded-full ' + result.barClass" [style.width.%]="result.confidence"></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class DiseaseDetectionComponent {
    symptoms = '';
    symptomTags = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Chest Pain', 'Shortness of Breath', 'Nausea'];
    results = [
        { disease: 'Tension Headache', confidence: 85, description: 'Common type of headache with mild to moderate pain', bgClass: 'bg-green-50', confidenceClass: 'bg-green-100 text-green-700', barClass: 'bg-green-500' },
        { disease: 'Migraine', confidence: 62, description: 'Severe recurring headache with potential nausea', bgClass: 'bg-yellow-50', confidenceClass: 'bg-yellow-100 text-yellow-700', barClass: 'bg-yellow-500' },
        { disease: 'Sinusitis', confidence: 35, description: 'Inflammation of the sinuses causing headache', bgClass: 'bg-red-50', confidenceClass: 'bg-red-100 text-red-700', barClass: 'bg-red-500' }
    ];
    addSymptom(tag: string) { this.symptoms += (this.symptoms ? ', ' : '') + tag; }
}
