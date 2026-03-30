export interface NotificationResponse {
  notificationId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;        // FORUM, ORDER, PAYMENT, APPOINTMENT, TELECONSULTATION
  redirectUrl: string;
  recipientId: number;
}
