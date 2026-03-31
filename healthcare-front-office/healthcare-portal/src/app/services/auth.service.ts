import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interface pour l'inscription - correspond au backend
export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  roleName: string;        // ⚠️ Changé de 'role' à 'roleName' pour correspondre au backend
  medicalLicense?: string; // Optionnel pour les professionnels
  dateOfBirth?: string;
  gender?: string;
  adresse?: string;
  specialty?: string;      // Spécialité pour les médecins (DOCTEUR)
}

// Interface pour la connexion
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  userId?: number;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  register(req: RegisterRequest): Observable<string> {
    console.log('Register request:', req); // Pour debug
    return this.http.post<string>(
      `${environment.baseUrl}/auth/register`,
      req,
      { responseType: 'text' as 'json' }
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    console.log('Login request:', req); // Pour debug
    return this.http.post<AuthResponse>(
      `${environment.baseUrl}/auth/login`,
      req
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrl}/auth/forgot-password`,
      { email }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrl}/auth/reset-password`,
      { token, newPassword }
    );
  }

  logout(): void {
    localStorage.clear();
  }

  getToken(): string | null {
    return localStorage.getItem('TokenUserConnect');
  }

  getRole(): string | null {
    return localStorage.getItem('RoleUserConnect');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
