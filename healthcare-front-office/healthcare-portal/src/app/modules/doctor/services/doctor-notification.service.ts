import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { WebSocketService } from '../../../services/websocket.service';

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
    // Fixed: backend path is /api/notifications
    private readonly base = 'http://localhost:8088/api/notifications';

    /** Emits a signal (true) whenever a new WS notification arrives */
    newNotification$ = new BehaviorSubject<NotificationDTO | null>(null);

    constructor(private http: HttpClient, private wsService: WebSocketService) { }

    /**
     * Start listening for real-time appointment notifications for this doctor.
     * Call once when the doctor logs in (or enters the notifications page).
     */
    subscribeToRealTime(doctorId: number): void {
        this.wsService.subscribe(`/topic/notifications/${doctorId}`, (msg) => {
            try {
                const payload = JSON.parse(msg.body);
                // Map the raw payload to a partial NotificationDTO so the UI can refresh
                const notif: NotificationDTO = {
                    notificationId: payload.notificationId,
                    message: payload.message,
                    read: false,
                    createdDate: payload.createdDate,
                    appointmentId: payload.appointmentId,
                    patientName: payload.patientName || '',
                    specialty: payload.specialty || '',
                    reasonForVisit: payload.reasonForVisit || '',
                    statusAppointement: 'PENDING',
                    scheduleDate: payload.scheduleDate || '',
                    scheduleTime: payload.scheduleTime || '',
                    doctorId: doctorId
                };
                this.newNotification$.next(notif);
            } catch (e) {
                console.error('[DoctorNotificationService] Failed to parse WS message', e);
            }
        });
    }

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
