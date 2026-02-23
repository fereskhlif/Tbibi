import { Component } from '@angular/core';
@Component({
    selector: 'app-ai-image-analysis', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">AI Image Analysis</h1><p class="text-gray-600 mb-6">Upload and analyze medical images with AI assistance</p>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Upload Medical Image</h3>
        <label class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
          <span class="text-5xl mb-3">🖼️</span><p class="text-gray-600 text-center">Drop your medical image here<br><span class="text-sm text-gray-400">X-Ray, MRI, CT Scan, Dermoscopy</span></p>
          <input type="file" accept="image/*" class="hidden" />
        </label>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <button *ngFor="let type of imageTypes" class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100">{{type}}</button>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Analysis Results</h3>
        <div class="space-y-4">
          <div *ngFor="let result of analysisResults" class="p-4 rounded-lg border border-gray-200">
            <div class="flex items-center justify-between mb-2"><h4 class="font-medium text-gray-900">{{result.finding}}</h4><span [class]="'px-2 py-1 text-xs rounded-full ' + result.severityClass">{{result.severity}}</span></div>
            <p class="text-sm text-gray-600 mb-2">{{result.description}}</p>
            <div class="flex items-center gap-2"><span class="text-xs text-gray-500">Confidence:</span><div class="flex-1 bg-gray-200 rounded-full h-2"><div [class]="'h-2 rounded-full ' + result.barClass" [style.width.%]="result.confidence"></div></div><span class="text-xs font-medium">{{result.confidence}}%</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class AiImageAnalysisComponent {
    imageTypes = ['X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'Dermoscopy', 'Retinal'];
    analysisResults = [
        { finding: 'Normal Cardiac Silhouette', confidence: 92, description: 'Heart size and shape appear within normal limits', severity: 'Normal', severityClass: 'bg-green-100 text-green-700', barClass: 'bg-green-500' },
        { finding: 'Minor Calcification', confidence: 78, description: 'Small calcification noted in the aortic arch region', severity: 'Low Risk', severityClass: 'bg-yellow-100 text-yellow-700', barClass: 'bg-yellow-500' },
        { finding: 'Clear Lung Fields', confidence: 95, description: 'No infiltrates, masses, or pleural effusions detected', severity: 'Normal', severityClass: 'bg-green-100 text-green-700', barClass: 'bg-green-500' }
    ];
}
