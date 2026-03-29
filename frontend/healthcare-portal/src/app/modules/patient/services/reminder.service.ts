import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HealthGoalReminder, Notification } from '../models/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private reminderApiUrl = 'http://localhost:8080/api/health-goals/reminders';

  constructor(private http: HttpClient) { }

  // Reminder Management
  createReminder(reminder: HealthGoalReminder): Observable<HealthGoalReminder> {
    return this.http.post<HealthGoalReminder>(this.reminderApiUrl, reminder);
  }

  updateReminder(id: number, reminder: HealthGoalReminder): Observable<HealthGoalReminder> {
    return this.http.put<HealthGoalReminder>(`${this.reminderApiUrl}/${id}`, reminder);
  }

  getReminderById(id: number): Observable<HealthGoalReminder> {
    return this.http.get<HealthGoalReminder>(`${this.reminderApiUrl}/${id}`);
  }

  getRemindersByGoal(goalId: number): Observable<HealthGoalReminder[]> {
    return this.http.get<HealthGoalReminder[]>(`${this.reminderApiUrl}/goal/${goalId}`);
  }

  getActiveReminders(): Observable<HealthGoalReminder[]> {
    return this.http.get<HealthGoalReminder[]>(`${this.reminderApiUrl}/active`);
  }

  deleteReminder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.reminderApiUrl}/${id}`);
  }

  // Notification Management
  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.reminderApiUrl}/user/${userId}/notifications`);
  }

  markNotificationAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.reminderApiUrl}/notifications/${notificationId}/read`, {});
  }

  sendReminder(reminderId: number): Observable<void> {
    return this.http.post<void>(`${this.reminderApiUrl}/send/${reminderId}`, {});
  }
}
