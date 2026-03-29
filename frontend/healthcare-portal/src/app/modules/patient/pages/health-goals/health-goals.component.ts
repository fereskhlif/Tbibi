import { Component, OnInit } from '@angular/core';
import { HealthGoal, HealthGoalProgress, GoalType } from '../../models/health-goal.model';
import { HealthGoalService } from '../../services/health-goal.service';

@Component({
  selector: 'app-health-goals',
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Health Goals</h1>
          <p class="mt-1 text-gray-500">Track and manage your personal health goals</p>
        </div>
        <button 
          (click)="openCreateModal()"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <lucide-icon name="plus" class="w-5 h-5"></lucide-icon>
          Add New Goal
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm">Total Goals</p>
          <p class="text-2xl font-bold text-gray-900">{{goals.length}}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p class="text-gray-600 text-sm">Achieved</p>
          <p class="text-2xl font-bold text-green-600">{{achievedCount}}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p class="text-gray-600 text-sm">In Progress</p>
          <p class="text-2xl font-bold text-yellow-600">{{inProgressCount}}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p class="text-gray-600 text-sm">Weekly Average</p>
          <p class="text-2xl font-bold text-purple-600">{{weeklyAverage}}%</p>
        </div>
      </div>

      <!-- Goals List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let goal of goals" 
             class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-t-4"
             [ngClass]="getGoalBorderColor(goal)">
          
          <!-- Goal Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3 flex-1">
              <div class="w-12 h-12 rounded-full flex items-center justify-center"
                   [ngClass]="getGoalBackgroundColor(goal)">
                <lucide-icon [name]="getGoalIcon(goal)" class="w-6 h-6 text-white"></lucide-icon>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{goal.goalTitle}}</h3>
                <p class="text-xs text-gray-500 capitalize">{{goal.goalType | lowercase}}</p>
              </div>
            </div>
            <button class="text-gray-400 hover:text-gray-600" (click)="toggleMenuFor(goal.id!)">
              <lucide-icon name="more-vertical" class="w-5 h-5"></lucide-icon>
            </button>
          </div>

          <!-- Goal Description -->
          <p class="text-sm text-gray-600 mb-4">{{goal.goalDescription}}</p>

          <!-- Progress Bar (for Numeric goals) -->
          <div *ngIf="goal.goalType === 'NUMERIC'" class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-medium text-gray-700">Progress</span>
              <span class="text-xs text-gray-500">
                {{goal.currentProgress | number: '1.0-0'}} / {{goal.targetValue}} {{goal.unit}}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full transition-all"
                   [style.width.%]="(goal.currentProgress! / goal.targetValue!) * 100">
              </div>
            </div>
          </div>

          <!-- Habit Progress (for Habit-based goals) -->
          <div *ngIf="goal.goalType === 'HABIT_BASED'" class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-medium text-gray-700">This Week</span>
              <span class="text-xs text-gray-500">
                <span [class.text-green-600]="weeklyGoalProgress[goal.id!] >= goal.frequencyPerWeek!">
                  {{weeklyGoalProgress[goal.id!] || 0}} / {{goal.frequencyPerWeek}} times
                </span>
              </span>
            </div>
            <div class="flex gap-1">
              <div *ngFor="let i of [0,1,2,3,4,5,6]" class="flex-1 h-8 rounded bg-gray-100 flex items-center justify-center">
                <span class="text-xs" [ngClass]="weeklyGoalProgress[goal.id!] > i ? 'text-green-600 font-bold' : 'text-gray-400'">
                  {{i + 1}}
                </span>
              </div>
            </div>
          </div>

          <!-- Goal Meta -->
          <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span>Target: {{goal.targetDate | date: 'MMM dd, yyyy'}}</span>
            <span>Created: {{goal.createdDate | date: 'MMM dd'}}</span>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button (click)="logProgress(goal)" 
                    class="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-medium transition-colors">
              Log Progress
            </button>
            <button (click)="editGoal(goal)" 
                    class="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-xs font-medium transition-colors">
              Edit
            </button>
            <button (click)="deleteGoal(goal.id!)" 
                    class="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs font-medium transition-colors">
              <lucide-icon name="trash-2" class="w-4 h-4"></lucide-icon>
            </button>
          </div>

          <!-- Status Badge -->
          <div class="mt-4 pt-4 border-t border-gray-100">
            <span *ngIf="goal.achieved" class="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              ✓ Achieved
            </span>
            <span *ngIf="!goal.achieved" class="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              In Progress
            </span>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="goals.length === 0" class="col-span-full">
          <div class="bg-white rounded-lg shadow p-12 text-center">
            <lucide-icon name="target" class="w-12 h-12 text-gray-400 mx-auto mb-4"></lucide-icon>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No health goals yet</h3>
            <p class="text-gray-500 mb-6">Start by creating your first health goal to begin tracking your progress.</p>
            <button (click)="openCreateModal()" 
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Your First Goal
            </button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">{{editingGoal ? 'Edit Goal' : 'Create New Goal'}}</h2>

          <form (ngSubmit)="saveGoal()" class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
              <input [(ngModel)]="formData.goalTitle" name="goalTitle" type="text" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="e.g., Daily Steps" required>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea [(ngModel)]="formData.goalDescription" name="goalDescription" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your health goal"
                        rows="3"></textarea>
            </div>

            <!-- Goal Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
              <select [(ngModel)]="formData.goalType" name="goalType" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="NUMERIC">Numeric (e.g., 10,000 steps)</option>
                <option value="BOOLEAN">Boolean (e.g., Exercise completed)</option>
                <option value="HABIT_BASED">Habit-Based (e.g., 3 times per week)</option>
              </select>
            </div>

            <!-- Target Value (for Numeric) -->
            <div *ngIf="formData.goalType === 'NUMERIC'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
              <input [(ngModel)]="formData.targetValue" name="targetValue" type="number" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="e.g., 10000">
            </div>

            <!-- Unit (for Numeric) -->
            <div *ngIf="formData.goalType === 'NUMERIC'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input [(ngModel)]="formData.unit" name="unit" type="text" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="e.g., steps, liters, minutes">
            </div>

            <!-- Frequency (for Habit-based) -->
            <div *ngIf="formData.goalType === 'HABIT_BASED'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Times Per Week</label>
              <input [(ngModel)]="formData.frequencyPerWeek" name="frequencyPerWeek" type="number" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="e.g., 3">
            </div>

            <!-- Target Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              <input [(ngModel)]="formData.targetDate" name="targetDate" type="date" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select [(ngModel)]="formData.category" name="category" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a category</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="fitness">Fitness</option>
                <option value="nutrition">Nutrition</option>
                <option value="hydration">Hydration</option>
                <option value="sleep">Sleep</option>
                <option value="mental-health">Mental Health</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button type="button" (click)="closeModal()" 
                      class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" 
                      class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {{editingGoal ? 'Update' : 'Create'}} Goal
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Progress Log Modal -->
      <div *ngIf="showProgressModal && selectedGoal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Log Progress - {{selectedGoal.goalTitle}}</h2>

          <form (ngSubmit)="saveProgress()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input [(ngModel)]="progressData.logDate" name="logDate" type="date" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <!-- Value (for Numeric) -->
            <div *ngIf="selectedGoal.goalType === 'NUMERIC'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Value ({{selectedGoal.unit}})
              </label>
              <input [(ngModel)]="progressData.value" name="value" type="number" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Enter value">
            </div>

            <!-- Completed (for Boolean/Habit) -->
            <div *ngIf="selectedGoal.goalType !== 'NUMERIC'">
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="progressData.completed" name="completed"
                       class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                <span class="text-sm font-medium text-gray-700">Completed Today</span>
              </label>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea [(ngModel)]="progressData.notes" name="notes" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add any notes..."
                        rows="2"></textarea>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button type="button" (click)="closeProgressModal()" 
                      class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" 
                      class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Log Progress
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class HealthGoalsComponent implements OnInit {
  goals: HealthGoal[] = [];
  selectedGoal: HealthGoal | null = null;
  editingGoal: HealthGoal | null = null;
  
  showModal = false;
  showProgressModal = false;

  formData: Partial<HealthGoal> = {
    goalType: 'NUMERIC' as GoalType,
  };

  progressData: Partial<HealthGoalProgress> = {
    logDate: new Date(),
    completed: false,
  };

  weeklyGoalProgress: { [key: number]: number } = {};

  readonly GoalType = GoalType;

  get achievedCount(): number {
    return this.goals.filter(g => g.achieved).length;
  }

  get inProgressCount(): number {
    return this.goals.filter(g => !g.achieved).length;
  }

  get weeklyAverage(): number {
    if (this.goals.length === 0) return 0;
    const average = Object.values(this.weeklyGoalProgress).reduce((a, b) => a + b, 0) / this.goals.length;
    return Math.round(average * 10) / 10;
  }

  constructor(private healthGoalService: HealthGoalService) {}

  ngOnInit(): void {
    this.loadGoals();
    this.loadWeeklyProgress();
  }

  loadGoals(): void {
    const userId = this.getUserIdFromLocalStorage();
    if (userId) {
      this.healthGoalService.getGoalsByUser(userId).subscribe({
        next: (goals) => {
          this.goals = goals;
        },
        error: (err) => console.error('Error loading goals:', err)
      });
    }
  }

  loadWeeklyProgress(): void {
    this.goals.forEach(goal => {
      this.healthGoalService.getWeeklyProgress(goal.id!).subscribe({
        next: (progress) => {
          this.weeklyGoalProgress[goal.id!] = progress;
        },
        error: (err) => console.error(`Error loading weekly progress for goal ${goal.id}:`, err)
      });
    });
  }

  openCreateModal(): void {
    this.editingGoal = null;
    this.formData = { goalType: 'NUMERIC' as GoalType };
    this.showModal = true;
  }

  editGoal(goal: HealthGoal): void {
    this.editingGoal = goal;
    this.formData = { ...goal };
    this.showModal = true;
  }

  saveGoal(): void {
    const userId = this.getUserIdFromLocalStorage();
    const goalData: HealthGoal = {
      ...this.formData as HealthGoal,
      userId: userId,
      achieved: this.editingGoal?.achieved || false,
    };

    if (this.editingGoal) {
      this.healthGoalService.updateGoal(this.editingGoal.id!, goalData).subscribe({
        next: () => {
          this.loadGoals();
          this.closeModal();
        },
        error: (err) => console.error('Error updating goal:', err)
      });
    } else {
      this.healthGoalService.createGoal(goalData).subscribe({
        next: () => {
          this.loadGoals();
          this.closeModal();
        },
        error: (err) => console.error('Error creating goal:', err)
      });
    }
  }

  deleteGoal(id: number): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.healthGoalService.deleteGoal(id).subscribe({
        next: () => {
          this.loadGoals();
        },
        error: (err) => console.error('Error deleting goal:', err)
      });
    }
  }

  logProgress(goal: HealthGoal): void {
    this.selectedGoal = goal;
    this.progressData = { 
      logDate: new Date(),
      completed: false,
      value: undefined,
      notes: undefined 
    };
    this.showProgressModal = true;
  }

  saveProgress(): void {
    if (this.selectedGoal) {
      const progressData: HealthGoalProgress = {
        ...this.progressData as HealthGoalProgress,
        logDate: new Date(this.progressData.logDate!),
      };

      this.healthGoalService.logProgress(this.selectedGoal.id!, progressData).subscribe({
        next: () => {
          this.loadGoals();
          this.loadWeeklyProgress();
          this.closeProgressModal();
        },
        error: (err) => console.error('Error logging progress:', err)
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.formData = { goalType: 'NUMERIC' as GoalType };
  }

  closeProgressModal(): void {
    this.showProgressModal = false;
    this.selectedGoal = null;
  }

  toggleMenuFor(id: number): void {
    // Implement menu toggle if needed for additional actions
  }

  getGoalIcon(goal: HealthGoal): string {
    const iconMap: { [key: string]: string } = {
      'weight-loss': 'scale',
      'fitness': 'dumbbell',
      'nutrition': 'apple',
      'hydration': 'droplet',
      'sleep': 'moon',
      'mental-health': 'brain',
      'other': 'target'
    };
    return iconMap[goal.category!] || 'target';
  }

  getGoalBackgroundColor(goal: HealthGoal): string {
    const colorMap: { [key: string]: string } = {
      'weight-loss': 'bg-red-500',
      'fitness': 'bg-orange-500',
      'nutrition': 'bg-green-500',
      'hydration': 'bg-blue-500',
      'sleep': 'bg-purple-500',
      'mental-health': 'bg-pink-500',
      'other': 'bg-gray-500'
    };
    return colorMap[goal.category!] || 'bg-blue-500';
  }

  getGoalBorderColor(goal: HealthGoal): string {
    const colorMap: { [key: string]: string } = {
      'weight-loss': 'border-red-500',
      'fitness': 'border-orange-500',
      'nutrition': 'border-green-500',
      'hydration': 'border-blue-500',
      'sleep': 'border-purple-500',
      'mental-health': 'border-pink-500',
      'other': 'border-gray-500'
    };
    return colorMap[goal.category!] || 'border-blue-500';
  }

  private getUserIdFromLocalStorage(): number {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.userId || user.id;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    return 0;
  }
}
