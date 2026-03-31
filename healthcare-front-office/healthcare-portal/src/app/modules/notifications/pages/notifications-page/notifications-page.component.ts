import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from '../../../../services/notification.service';
import { NotificationResponse } from '../../../../models/notification.model';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html'
})
export class NotificationsPageComponent implements OnInit {
  currentUserId = 1; // Hardcoded testing

  constructor(
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Usually initialized by layout, but safe to call
    this.notificationService.init(this.currentUserId);
  }

  get unreadNotifications$(): Observable<NotificationResponse[]> {
    return this.notificationService.notifications$.pipe(
      map(notes => notes.filter(n => !n.isRead))
    );
  }

  get readNotifications$(): Observable<NotificationResponse[]> {
    return this.notificationService.notifications$.pipe(
      map(notes => notes.filter(n => n.isRead))
    );
  }

  onNotificationClick(n: NotificationResponse): void {
    this.notificationService.onNotificationClick(n);
    if (n.redirectUrl) {
      this.router.navigateByUrl(n.redirectUrl);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead(this.currentUserId);
  }

  timeAgoNotification(dateStr: string): string {
    const date = new Date(dateStr), now = new Date();
    const s = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
