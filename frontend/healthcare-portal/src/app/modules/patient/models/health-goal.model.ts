export enum GoalType {
  NUMERIC = 'NUMERIC',
  BOOLEAN = 'BOOLEAN',
  HABIT_BASED = 'HABIT_BASED'
}

export interface HealthGoal {
  id?: number;
  goalTitle: string;
  goalDescription: string;
  goalType: GoalType;
  targetValue?: number;
  unit?: string;
  frequencyPerWeek?: number;
  achieved: boolean;
  currentProgress?: number;
  createdDate: Date;
  targetDate?: Date;
  lastUpdatedDate?: Date;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
  progressLogs?: HealthGoalProgress[];
}

export interface HealthGoalProgress {
  id?: number;
  healthGoalId?: number;
  logDate: Date;
  value?: number;
  completed?: boolean;
  notes?: string;
  recordedAt?: Date;
  weeklyProgress?: number;
}

export interface GoalCategory {
  name: string;
  icon: string;
  color: string;
}
