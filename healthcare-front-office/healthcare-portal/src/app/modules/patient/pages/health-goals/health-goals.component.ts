import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface HealthGoal {
  id?: number;
  goalTitle: string;
  goalDescription: string;
  goalType: 'NUMERIC' | 'BOOLEAN' | 'HABIT_BASED';
  category: string;
  targetValue?: number;
  currentProgress?: number;
  unit?: string;
  targetDate?: string;
  achieved?: boolean;
  frequencyPerWeek?: number;
}

@Component({
  selector: 'app-health-goals',
  template: `
<div class="p-6 space-y-6">

  <!-- Header -->
  <div class="flex items-center justify-between flex-wrap gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">🎯 Health Goals</h1>
      <p class="text-gray-500 text-sm mt-1">Set, track and achieve your personal health goals</p>
    </div>
    <button (click)="showForm = !showForm"
      class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow">
      <span>＋</span> New Goal
    </button>
  </div>

  <!-- Create Goal Form -->
  <div *ngIf="showForm" class="bg-white rounded-2xl border border-blue-100 shadow-lg p-6 space-y-4">
    <h2 class="text-lg font-bold text-gray-800">Create New Goal</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Goal Title *</label>
        <input [(ngModel)]="newGoal.goalTitle" placeholder="e.g. Lose 5kg"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input [(ngModel)]="newGoal.category" placeholder="e.g. Weight, Fitness, Sleep"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input [(ngModel)]="newGoal.goalDescription" placeholder="Describe your goal..."
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
        <select [(ngModel)]="newGoal.goalType"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="NUMERIC">Numeric</option>
          <option value="BOOLEAN">Yes/No</option>
          <option value="HABIT_BASED">Habit Based</option>
        </select>
      </div>
      <div *ngIf="newGoal.goalType === 'NUMERIC'">
        <label class="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
        <input [(ngModel)]="newGoal.targetValue" type="number" placeholder="e.g. 70"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
      </div>
      <div *ngIf="newGoal.goalType === 'NUMERIC'">
        <label class="block text-sm font-medium text-gray-700 mb-1">Unit (e.g. kg, steps)</label>
        <input [(ngModel)]="newGoal.unit" placeholder="kg"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
      </div>
      <div *ngIf="newGoal.goalType === 'HABIT_BASED'">
        <label class="block text-sm font-medium text-gray-700 mb-1">Frequency per Week</label>
        <input [(ngModel)]="newGoal.frequencyPerWeek" type="number" min="1" max="7" placeholder="e.g. 3"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
        <input [(ngModel)]="newGoal.targetDate" type="date"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
      </div>
    </div>
    <div class="flex gap-3 pt-2">
      <button (click)="createGoal()"
        class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
        Save Goal
      </button>
      <button (click)="showForm = false; resetForm()"
        class="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition">
        Cancel
      </button>
    </div>
  </div>

  <!-- Loading -->
  <div *ngIf="loading" class="flex justify-center py-20">
    <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>

  <!-- Empty state -->
  <div *ngIf="!loading && goals.length === 0" class="text-center py-20">
    <div class="text-6xl mb-4">🎯</div>
    <h3 class="text-lg font-semibold text-gray-700">No health goals yet</h3>
    <p class="text-gray-400 text-sm mt-1">Click "New Goal" to set your first health goal</p>
  </div>

  <!-- Goals Grid -->
  <div *ngIf="!loading && goals.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    <div *ngFor="let goal of goals"
      class="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 space-y-3"
      [class.border-green-300]="goal.achieved"
      [class.border-gray-100]="!goal.achieved">

      <!-- Top row -->
      <div class="flex items-start justify-between gap-2">
        <div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
            [class]="typeChip(goal.goalType)">{{goal.goalType}}</span>
          <h3 class="text-base font-bold text-gray-900 mt-1">{{goal.goalTitle}}</h3>
          <p class="text-xs text-gray-500 mt-0.5">{{goal.goalDescription}}</p>
        </div>
        <span *ngIf="goal.achieved"
          class="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">✓ Done</span>
      </div>

      <!-- Category -->
      <div *ngIf="goal.category" class="text-xs text-indigo-600 font-medium">
        📂 {{goal.category}}
      </div>

      <!-- Progress bar (numeric) -->
      <div *ngIf="goal.goalType === 'NUMERIC' && goal.targetValue">
        <div class="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{{goal.currentProgress ?? 0}} / {{goal.targetValue}} {{goal.unit}}</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="h-2 rounded-full transition-all duration-500"
            [class]="goal.achieved ? 'bg-green-500' : 'bg-blue-500'"
            [style.width]="progressPct(goal) + '%'">
          </div>
        </div>
        <p class="text-xs text-right text-gray-400 mt-0.5">{{progressPct(goal)}}%</p>
      </div>

      <!-- Habit frequency -->
      <div *ngIf="goal.goalType === 'HABIT_BASED' && goal.frequencyPerWeek" class="text-xs text-gray-500">
        🔁 {{goal.frequencyPerWeek}}x per week
      </div>

      <!-- Target date -->
      <div *ngIf="goal.targetDate" class="text-xs text-gray-400">
        📅 Target: {{goal.targetDate | date:'mediumDate'}}
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 pt-1">
        <button *ngIf="!goal.achieved && goal.goalType === 'NUMERIC'"
          (click)="openProgressModal(goal)"
          class="flex-1 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition">
          Update Progress
        </button>
        <button *ngIf="!goal.achieved && goal.goalType === 'BOOLEAN'"
          (click)="markAchieved(goal)"
          class="flex-1 py-1.5 text-xs font-semibold bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition">
          Mark Done ✓
        </button>
        <button (click)="deleteGoal(goal.id!)"
          class="py-1.5 px-3 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition">
          🗑
        </button>
      </div>
    </div>
  </div>

  <!-- Progress Update Modal -->
  <div *ngIf="selectedGoal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    (click)="selectedGoal = null">
    <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" (click)="$event.stopPropagation()">
      <h3 class="text-lg font-bold text-gray-800 mb-4">Update Progress</h3>
      <p class="text-sm text-gray-600 mb-3">
        <strong>{{selectedGoal.goalTitle}}</strong> — target: {{selectedGoal.targetValue}} {{selectedGoal.unit}}
      </p>
      <label class="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
      <input [(ngModel)]="progressValue" type="number"
        [placeholder]="'Enter value in ' + selectedGoal.unit"
        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"/>
      <div class="flex gap-3">
        <button (click)="submitProgress()"
          class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
          Save
        </button>
        <button (click)="selectedGoal = null"
          class="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition">
          Cancel
        </button>
      </div>
    </div>
  </div>

</div>
`,
  styles: []
})
export class HealthGoalsComponent implements OnInit {
  goals: HealthGoal[] = [];
  loading = false;
  showForm = false;
  selectedGoal: HealthGoal | null = null;
  progressValue: number = 0;

  newGoal: HealthGoal = {
    goalTitle: '',
    goalDescription: '',
    goalType: 'NUMERIC',
    category: '',
    targetValue: undefined,
    unit: '',
    targetDate: '',
    frequencyPerWeek: undefined
  };

  private readonly baseUrl = 'http://localhost:8088/api/health-goals';

  private get userId(): number {
    return Number(localStorage.getItem('userId') || 1);
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.loading = true;
    this.http.get<HealthGoal[]>(`${this.baseUrl}/user/${this.userId}`)
      .subscribe({
        next: data => { this.goals = data; this.loading = false; },
        error: () => { this.goals = []; this.loading = false; }
      });
  }

  createGoal() {
    if (!this.newGoal.goalTitle.trim()) return;
    
    // Create a strict payload
    const payload: any = { ...this.newGoal, userId: this.userId };
    if (!payload.targetDate) {
      delete payload.targetDate; // Prevent Jackson from failing on ""
    }

    this.http.post<HealthGoal>(this.baseUrl, payload)
      .subscribe({
        next: created => {
          this.goals.unshift(created);
          this.showForm = false;
          this.resetForm();
        },
        error: () => alert('Failed to create goal. Please try again.')
      });
  }

  deleteGoal(id: number) {
    if (!confirm('Delete this goal?')) return;
    this.http.delete(`${this.baseUrl}/${id}`)
      .subscribe({
        next: () => this.goals = this.goals.filter(g => g.id !== id),
        error: () => alert('Failed to delete goal.')
      });
  }

  openProgressModal(goal: HealthGoal) {
    this.selectedGoal = goal;
    this.progressValue = goal.currentProgress ?? 0;
  }

  submitProgress() {
    if (!this.selectedGoal) return;
    const id = this.selectedGoal.id!;
    this.http.post(`${this.baseUrl}/${id}/progress`, { value: this.progressValue })
      .subscribe({
        next: () => {
          const g = this.goals.find(x => x.id === id);
          if (g) {
            g.currentProgress = this.progressValue;
            if (g.targetValue && this.progressValue >= g.targetValue) g.achieved = true;
          }
          this.selectedGoal = null;
        },
        error: () => alert('Failed to update progress.')
      });
  }

  markAchieved(goal: HealthGoal) {
    goal.achieved = true;
  }

  progressPct(goal: HealthGoal): number {
    if (!goal.targetValue || !goal.currentProgress) return 0;
    return Math.min(100, Math.round((goal.currentProgress / goal.targetValue) * 100));
  }

  typeChip(type: string): string {
    const map: Record<string, string> = {
      NUMERIC: 'bg-blue-100 text-blue-700',
      BOOLEAN: 'bg-purple-100 text-purple-700',
      HABIT_BASED: 'bg-orange-100 text-orange-700'
    };
    return map[type] ?? 'bg-gray-100 text-gray-600';
  }

  resetForm() {
    this.newGoal = {
      goalTitle: '', goalDescription: '', goalType: 'NUMERIC',
      category: '', targetValue: undefined, unit: '', targetDate: '', frequencyPerWeek: undefined
    };
  }
}
