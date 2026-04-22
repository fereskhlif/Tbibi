import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalChatDto } from './chat-websocket.service';

export interface UserProfile {
  userId: number;
  name: string;
  email: string;
  adresse: string;
  dateOfBirth: string;
  gender: string;
  profilePicture: string;
  role: string;       // kept for backward compat
  roleName: string;   // matches backend UserProfileDTO
}

@Injectable({
  providedIn: 'root'
})
export class ChatHttpService {

  private readonly baseUrl = 'http://localhost:8088/medical-chat';
  private readonly usersBaseUrl = 'http://localhost:8088/users';

  constructor(private http: HttpClient) { }

  private authHeaders(): HttpHeaders {
    let token = localStorage.getItem('TokenUserConnect') || localStorage.getItem('token') || '';
    token = token.replace(/^"|"$/g, '').trim();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  public getConversationHistory(senderId: number, receiverId: number): Observable<MedicalChatDto[]> {
    return this.http.get<MedicalChatDto[]>(`${this.baseUrl}/conversation`, {
      headers: this.authHeaders(),
      params: { 
        senderId: senderId.toString(), 
        receiverId: receiverId.toString() 
      }
    });
  }

  public getRecentContacts(userId: number): Observable<MedicalChatDto[]> {
    return this.http.get<MedicalChatDto[]>(`${this.baseUrl}/user/${userId}`, {
      headers: this.authHeaders()
    });
  }

  public uploadAttachment(file: File): Observable<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ fileUrl: string }>(`${this.baseUrl}/upload`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${(localStorage.getItem('TokenUserConnect') || '').replace(/^"|"$/g, '').trim()}` })
    });
  }

  // Get all doctors for patient selection
  public getAllDoctors(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.usersBaseUrl}/doctors`, {
      headers: this.authHeaders()
    });
  }

  // Get all patients for doctor selection
  public getAllPatients(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.usersBaseUrl}/patients`, {
      headers: this.authHeaders()
    });
  }

  // Search doctors by name
  public searchDoctors(name: string): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.usersBaseUrl}/doctors/search`, {
      params: { name }
    });
  }

  // Search patients by name
  public searchPatients(name: string): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.usersBaseUrl}/patients/search`, {
      params: { name }
    });
  }
}
