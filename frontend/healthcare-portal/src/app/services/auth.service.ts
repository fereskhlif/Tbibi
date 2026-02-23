import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'ROLE_PATIENT' | 'ROLE_DOCTOR' | 'ROLE_PHARMACIST' | 'ROLE_PHYSIOTHERAPIST' | 'ROLE_LABORATORY';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  register(req: RegisterRequest): Observable<string> {
    return this.http.post<string>(
      `${environment.baseUrl}/auth/register`,
      req,
      { responseType: 'text' as 'json' }
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.baseUrl}/auth/login`,
      req
    );
  }

  logout(): void {
    localStorage.removeItem('TokenUserConnect');
    localStorage.removeItem('EmailUserConnect');
    localStorage.removeItem('RoleUserConnect');
  }

  // Helpers utiles
  getToken(): string | null {
    const token = localStorage.getItem('TokenUserConnect');
    return token ? JSON.parse(token) : null;
  }

  getRole(): string | null {
    const role = localStorage.getItem('RoleUserConnect');
    return role ? JSON.parse(role) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}