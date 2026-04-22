import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  roleName: string;
  documentBase64?: string;
  documentName?: string;
  dateOfBirth?: string;
  gender?: string;
  adresse?: string;
  specialty?: string;
  pharmacyName?: string;
  pharmacyAddress?: string;
  phone: string;
  profilePictureBase64?: string;
  profilePictureName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  userId?: number;
  name: string;
  pharmacyId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  register(req: RegisterRequest): Observable<string> {
    console.log('Register request:', req);
    return this.http.post<string>(
      `${environment.baseUrl}/auth/register`,
      req,
      { responseType: 'text' as 'json' }
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    console.log('Login request:', req);
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