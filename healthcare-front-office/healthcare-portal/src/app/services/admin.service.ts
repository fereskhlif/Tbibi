import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUser {
  userId: number;
  name: string;
  email: string;
  roleName: string;
  dateOfBirth: string;
  gender: string;
  accountStatus: 'PENDING' | 'ACTIVE' | 'BLOCKED' | 'REJECTED';
  enabled: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeProfessionals: number;
  pendingApprovals: number;
  blockedUsers: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.baseUrl}/admin`;
  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }
  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }
  getPendingApprovals(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users/pending`);
  }
  updateUserStatus(userId: number, status: 'PENDING' | 'ACTIVE' | 'BLOCKED' | 'REJECTED'): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${userId}/status`, { status });
  }
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }
}