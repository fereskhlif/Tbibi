import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfileDTO {
  userId: number;
  name: string;
  email: string;
  adresse: string;
  dateOfBirth: string;
  gender: string;
  profilePicture: string;
  roleName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8088/api/user';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    let token = localStorage.getItem('TokenUserConnect');
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProfile(): Observable<UserProfileDTO> {
    return this.http.get<UserProfileDTO>(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  uploadProfilePicture(file: File): Observable<UserProfileDTO> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    // Ne pas définir 'Content-Type': 'multipart/form-data', Angular s'en charge avec le boundary
    let token = localStorage.getItem('TokenUserConnect');
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<UserProfileDTO>(`${this.apiUrl}/profile-picture`, formData, { headers: headers });
  }

  updateProfile(data: { name?: string; email?: string }): Observable<UserProfileDTO> {
    return this.http.put<UserProfileDTO>(`${this.apiUrl}/profile`, data, { headers: this.getHeaders() });
  }

  changePassword(oldPw: string, newPw: string): Observable<any> {
    const payload = { oldPassword: oldPw, newPassword: newPw };
    return this.http.post(`${this.apiUrl}/change-password`, payload, { headers: this.getHeaders() });
  }
}
