import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HealthGoal, HealthGoalProgress } from '../models/health-goal.model';

@Injectable({
  providedIn: 'root'
})
export class HealthGoalService {
  private apiUrl = 'http://localhost:8080/api/health-goals';

  constructor(private http: HttpClient) { }

  // Goal CRUD Operations
  createGoal(goal: HealthGoal): Observable<HealthGoal> {
    return this.http.post<HealthGoal>(this.apiUrl, goal);
  }

  updateGoal(id: number, goal: HealthGoal): Observable<HealthGoal> {
    return this.http.put<HealthGoal>(`${this.apiUrl}/${id}`, goal);
  }

  getGoalById(id: number): Observable<HealthGoal> {
    return this.http.get<HealthGoal>(`${this.apiUrl}/${id}`);
  }

  getGoalsByUser(userId: number): Observable<HealthGoal[]> {
    return this.http.get<HealthGoal[]>(`${this.apiUrl}/user/${userId}`);
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Progress Tracking
  logProgress(goalId: number, progress: HealthGoalProgress): Observable<HealthGoalProgress> {
    return this.http.post<HealthGoalProgress>(`${this.apiUrl}/${goalId}/progress`, progress);
  }

  getProgressByGoal(goalId: number): Observable<HealthGoalProgress[]> {
    return this.http.get<HealthGoalProgress[]>(`${this.apiUrl}/${goalId}/progress`);
  }

  getProgressByDateRange(goalId: number, startDate: Date, endDate: Date): Observable<HealthGoalProgress[]> {
    let params = new HttpParams()
      .set('startDate', this.formatDate(startDate))
      .set('endDate', this.formatDate(endDate));
    return this.http.get<HealthGoalProgress[]>(`${this.apiUrl}/${goalId}/progress/range`, { params });
  }

  getProgressByDate(goalId: number, date: Date): Observable<HealthGoalProgress> {
    return this.http.get<HealthGoalProgress>(`${this.apiUrl}/${goalId}/progress/${this.formatDate(date)}`);
  }

  deleteProgress(progressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/progress/${progressId}`);
  }

  // Analytics
  getWeeklyProgress(goalId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${goalId}/weekly-progress`);
  }

  checkIfAchieved(goalId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${goalId}/check-achieved`);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
