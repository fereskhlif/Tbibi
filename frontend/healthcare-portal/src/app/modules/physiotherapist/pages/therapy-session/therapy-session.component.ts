import { Component } from '@angular/core';
@Component({
    selector: 'app-therapy-session', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Active Therapy Session</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-gray-900">Session: Post-Surgery Rehabilitation</h3><span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">In Progress</span></div>
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 rounded-lg p-3 text-center"><p class="text-xs text-gray-500">Duration</p><p class="text-lg font-bold text-purple-600">{{sessionTimer}}</p></div>
            <div class="bg-gray-50 rounded-lg p-3 text-center"><p class="text-xs text-gray-500">Exercises Done</p><p class="text-lg font-bold text-gray-900">3/6</p></div>
            <div class="bg-gray-50 rounded-lg p-3 text-center"><p class="text-xs text-gray-500">Progress</p><p class="text-lg font-bold text-green-600">50%</p></div>
          </div>
          <h4 class="font-medium text-gray-900 mb-3">Exercise Program</h4>
          <div class="space-y-3">
            <div *ngFor="let ex of exercises" class="flex items-center gap-4 p-3 rounded-lg" [class]="ex.done ? 'bg-green-50' : 'bg-gray-50'">
              <button (click)="ex.done = !ex.done" [class]="'w-6 h-6 rounded-full border-2 flex items-center justify-center ' + (ex.done ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300')">
                <span *ngIf="ex.done">✓</span>
              </button>
              <div class="flex-1"><p class="font-medium text-gray-900">{{ex.name}}</p><p class="text-sm text-gray-500">{{ex.sets}} sets × {{ex.reps}} reps</p></div>
              <span class="text-sm text-gray-500">{{ex.duration}}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Patient: John Doe</h3>
          <div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-500">Condition</span><span>ACL Reconstruction</span></div><div class="flex justify-between"><span class="text-gray-500">Session #</span><span>12 of 16</span></div><div class="flex justify-between"><span class="text-gray-500">Pain Level</span><span class="text-orange-600">3/10</span></div></div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Session Notes</h3>
          <textarea class="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none text-sm" placeholder="Add session notes..."></textarea>
          <button class="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">End Session</button>
        </div>
      </div>
    </div>
  </div>
` })
export class TherapySessionComponent {
    sessionTimer = '00:23:45';
    exercises = [
        { name: 'Quad Sets', sets: 3, reps: 10, duration: '5 min', done: true },
        { name: 'Straight Leg Raises', sets: 3, reps: 10, duration: '5 min', done: true },
        { name: 'Heel Slides', sets: 3, reps: 15, duration: '5 min', done: true },
        { name: 'Wall Squats', sets: 3, reps: 10, duration: '8 min', done: false },
        { name: 'Step-Ups', sets: 3, reps: 10, duration: '8 min', done: false },
        { name: 'Balance Board', sets: 2, reps: 1, duration: '10 min', done: false }
    ];
}
