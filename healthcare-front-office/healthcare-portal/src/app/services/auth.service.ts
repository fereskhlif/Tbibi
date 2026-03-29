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
  firstName?: string;
  lastName?: string;
  userId?: number;
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

  logout(): void {
    localStorage.clear();
  }

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

  getCurrentUserId(): number {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const id = parseInt(storedUserId, 10);
      if (!isNaN(id) && id > 0) {
        return id;
      }
    }
    
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