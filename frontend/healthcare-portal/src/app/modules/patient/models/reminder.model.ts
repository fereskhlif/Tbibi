export interface HealthGoalReminder {
  id?: number;
  healthGoalId: number;
  reminderTime: string; // HH:MM format
  dailyReminder: boolean;
  weekdayOnly: boolean;
  enabled: boolean;
  reminderMessage?: string;
}

export interface Notification {
  id?: number;
  title: string;
  message: string;
  type: 'REMINDER' | 'ALERT' | 'INFO' | 'SUCCESS';
  read: boolean;
  createdAt?: Date;
}
