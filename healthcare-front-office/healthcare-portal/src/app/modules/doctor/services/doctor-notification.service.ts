import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationDTO {
    notificationId: number;
    message: string;
    read: boolean;
    createdDate: string;
    appointmentId: number;
    patientName: string;
    specialty: string;
    reasonForVisit: string;
    statusAppointement: string;
    scheduleDate: string;
    scheduleTime: string;
    doctorId: number;
}

@Injectable({ providedIn: 'root' })
export class DoctorNotificationService {
    private readonly base = 'http://localhost:8088/notifications';

    constructor(private http: HttpClient) { }

    getNotifications(doctorId: number): Observable<NotificationDTO[]> {
        return this.http.get<NotificationDTO[]>(`${this.base}/doctor/${doctorId}`);
    }

    getUnreadCount(doctorId: number): Observable<number> {
        return this.http.get<number>(`${this.base}/doctor/${doctorId}/unread-count`);
    }

    accept(notifId: number): Observable<NotificationDTO> {
        return this.http.patch<NotificationDTO>(`${this.base}/${notifId}/accept`, {});
    }

    refuse(notifId: number): Observable<NotificationDTO> {
        return this.http.patch<NotificationDTO>(`${this.base}/${notifId}/refuse`, {});
    }

    markRead(notifId: number): Observable<void> {
        return this.http.patch<void>(`${this.base}/${notifId}/read`, {});
    }
}
