import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8088/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // ── LOGIN ─────────────────────────────────────────────
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        localStorage.setItem('email', res.email);
        localStorage.setItem('userId', res.userId?.toString() || '0');  // ✅ Store userId
      })
    );
  }

  // ── REGISTER ──────────────────────────────────────────
  register(name: string, email: string, password: string, roleName: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/register`,
      { name, email, password, roleName },
      { responseType: 'text' }
    );
  }

  // ── LOGOUT ────────────────────────────────────────────
  logout() {
    localStorage.clear(); // ✅ CORRIGÉ : vide tout au lieu de removeItem un par un
    this.router.navigate(['/']);
  }

  // ── TOKEN ─────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ── IS LOGGED IN ──────────────────────────────────────
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.clear();
        return false;
      }
      return true;
    } catch {
      localStorage.clear();
      return false;
    }
  }

  // ── USER INFO ─────────────────────────────────────────
  getCurrentUserRole(): string {
    return localStorage.getItem('role') || '';
  }

  getCurrentUserEmail(): string {
    return localStorage.getItem('email') || '';
  }

  getCurrentUserId(): number {
    // ✅ First try to get from localStorage (stored during login)
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const id = parseInt(storedUserId, 10);
      if (!isNaN(id) && id > 0) {
        return id;
      }
    }
    
    // ✅ Fallback: try to parse from token (though it won't have userId)
    const token = this.getToken();
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || 0;
    } catch {
      return 0;
    }
  }
}