import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationResponse } from '../models/notification.model';
import { WebSocketService } from './websocket.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8088/api/notifications';

  notifications$ = new BehaviorSubject<NotificationResponse[]>([]);
  unreadCount$ = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private wsService: WebSocketService
  ) {}

  /** Initialize: load existing notifications + subscribe to real-time push */
  init(userId: number): void {
    this.loadNotifications(userId);
    this.loadUnreadCount(userId);
    this.subscribeToRealTime(userId);
  }

  private loadNotifications(userId: number): void {
    this.http.get<NotificationResponse[]>(`${this.apiUrl}/user/${userId}`).subscribe({
      next: (data) => this.notifications$.next(data),
      error: (err) => console.error('[Notifications] Load error:', err)
    });
  }

  private loadUnreadCount(userId: number): void {
    this.http.get<number>(`${this.apiUrl}/unread-count/${userId}`).subscribe({
      next: (count) => this.unreadCount$.next(count),
      error: () => {}
    });
  }

  private playNotificationSound(): void {
    const audio = new Audio('assets/sounds/notification.mp3');
    audio.load();
    audio.play().catch(err => console.log('[Notifications] Audio play blocked by browser:', err));
  }

  private subscribeToRealTime(userId: number): void {
    this.wsService.subscribe(`/topic/notifications/${userId}`, (msg) => {
      const notification: NotificationResponse = JSON.parse(msg.body);
      // Prepend to the list
      const current = this.notifications$.value;
      this.notifications$.next([notification, ...current]);
      // Increment unread count
      this.unreadCount$.next(this.unreadCount$.value + 1);
      
      // 🔊 Play sound effect
      this.playNotificationSound();
    });
  }

  markAsRead(notificationId: number): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(`${this.apiUrl}/${notificationId}/read`, null);
  }

  markAllAsRead(userId: number): void {
    this.http.put<void>(`${this.apiUrl}/read-all/${userId}`, null).subscribe({
      next: () => {
        // Update local state
        const updated = this.notifications$.value.map(n => ({ ...n, isRead: true }));
        this.notifications$.next(updated);
        this.unreadCount$.next(0);
      }
    });
  }

  /** Mark a single notification as read locally and on server */
  onNotificationClick(notification: NotificationResponse): void {
    if (!notification.isRead) {
      this.markAsRead(notification.notificationId).subscribe({
        next: () => {
          const updated = this.notifications$.value.map(n =>
            n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
          );
          this.notifications$.next(updated);
          this.unreadCount$.next(Math.max(0, this.unreadCount$.value - 1));
        }
      });
    }
  }
}
