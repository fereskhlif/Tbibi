import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';

export interface NotificationDTO {
  patientId: number;
  message: string;
  testName: string;
  status: string;
  date: string;
}

export interface Notification {
  notificationId: number;
  message: string;
  read: boolean;
  createdDate: string;
  laboratoryResult?: {
    labId: number;
    testName: string;
    status: string;
  };
  recipient?: {
    userId: number;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:8088/api/notifications';
  private stompClient!: Client;
  private notificationSubject = new Subject<NotificationDTO>();
  public notifications$ = this.notificationSubject.asObservable();
  public notificationList: NotificationDTO[] = [];
  public unreadCount: number = 0;

  constructor(private http: HttpClient) {}

  // ✅ Récupérer toutes les notifications d'un utilisateur
  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`);
  }

  // ✅ Récupérer les notifications non lues
  getUnreadNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/unread`);
  }

  // ✅ Compter les notifications non lues
  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user/${userId}/unread/count`);
  }

  // ✅ Marquer une notification comme lue
  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // ✅ Marquer toutes les notifications comme lues
  markAllAsReadForUser(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/${userId}/read-all`, {});
  }

  // ✅ Supprimer une notification
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }

  // ✅ WebSocket (temps réel)
  connect(patientId: number): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8088/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connecté pour patient:', patientId);
        this.stompClient.subscribe(
          `/topic/notifications/${patientId}`,
          (message: IMessage) => {
            const notification: NotificationDTO = JSON.parse(message.body);
            this.notificationList.unshift(notification);
            this.unreadCount++;
            this.notificationSubject.next(notification);
          }
        );
      },
      onDisconnect: () => {
        console.log('❌ WebSocket déconnecté');
      }
    });
    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }

  markAllAsRead(): void {
    this.unreadCount = 0;
  }
}