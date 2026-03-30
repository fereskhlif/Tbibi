import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface LaboratoryResult {
  labId: number;
  testName: string;
  location: string;
  nameLabo: string;
  resultValue: string;
  status: string;
  testDate: string;
  notificationMessage?: string;
  patient?: {
    userId: number;
    name: string;
  };
}

interface Notification {
  notificationId: number;
  message: string;
  read: boolean;
  createdDate: string;
}

@Component({
  selector: 'app-doctor-lab-results',
  templateUrl: './lab-results.component.html',
  styleUrls: ['./lab-results.component.css']
})
export class DoctorLabResultsComponent implements OnInit {
  results: LaboratoryResult[] = [];
  notifications: Notification[] = [];
  unreadCount: number = 0;
  currentUserId: number = 7; // Doctor ID par défaut

  // ✅ Request test form
  showRequestForm = false;
  requestForm = {
    patientId: null as number | null,
    testName: '',
    priority: 'Normal',
    requestNotes: ''
  };

  private apiUrl = 'http://localhost:8088/api/laboratory-results';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLabResults();
    this.loadNotifications();
  }

  loadLabResults() {
    // ✅ CORRIGÉ - URL correcte sans duplication
    this.http.get<LaboratoryResult[]>(`${this.apiUrl}/doctor/${this.currentUserId}`)
      .subscribe({
        next: (data: LaboratoryResult[]) => {
          this.results = data;
          console.log('Doctor lab results loaded:', data);
        },
        error: (err: any) => {
          console.error('Error loading lab results:', err);
        }
      });
  }

  loadNotifications() {
    this.http.get<Notification[]>(`http://localhost:8088/api/notifications/user/${this.currentUserId}`)
      .subscribe({
        next: (data: Notification[]) => {
          this.notifications = data;
          this.updateUnreadCount();
          console.log('Doctor notifications loaded:', data);
        },
        error: (err: any) => {
          console.warn('Notifications not available:', err.message);
          // Don't show error to user, just continue without notifications
          this.notifications = [];
          this.unreadCount = 0;
        }
      });
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  markNotificationAsRead(notification: Notification) {
    if (!notification.read) {
      // ✅ CORRIGÉ - URL pour notifications
      this.http.put(`http://localhost:8088/api/notifications/${notification.notificationId}/read`, {})
        .subscribe({
          next: () => {
            notification.read = true;
            this.updateUnreadCount();
          },
          error: (err: any) => {
            console.error('Error marking notification as read:', err);
          }
        });
    }
  }

  markAllAsRead() {
    // ✅ CORRIGÉ - URL pour notifications
    this.http.put(`http://localhost:8088/api/notifications/user/${this.currentUserId}/read-all`, {})
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.read = true);
          this.updateUnreadCount();
        },
        error: (err: any) => {
          console.error('Error marking all as read:', err);
        }
      });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Completed': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  }

  reviewResult(result: LaboratoryResult) {
    alert(`Reviewing lab result for ${result.testName}...`);
  }

  // ✅ Request a new lab test
  openRequestForm() {
    this.showRequestForm = true;
    this.requestForm = {
      patientId: null,
      testName: '',
      priority: 'Normal',
      requestNotes: ''
    };
  }

  closeRequestForm() {
    this.showRequestForm = false;
  }

  submitTestRequest() {
    if (!this.requestForm.patientId || !this.requestForm.testName) {
      alert('Please fill in Patient ID and Test Name');
      return;
    }

    const request = {
      testName: this.requestForm.testName,
      location: 'To be determined',
      nameLabo: 'Central Laboratory',
      resultValue: 'Pending analysis',
      status: 'Pending',
      testDate: new Date().toISOString().split('T')[0],
      laboratoryUserId: 4, // Default lab technician
      patientId: this.requestForm.patientId,
      prescribedByDoctorId: this.currentUserId,
      priority: this.requestForm.priority,
      requestNotes: this.requestForm.requestNotes
    };

    this.http.post(`${this.apiUrl}`, request).subscribe({
      next: () => {
        alert('✅ Test request sent to laboratory successfully!');
        this.closeRequestForm();
        this.loadLabResults();
      },
      error: (err) => {
        console.error('Error requesting test:', err);
        alert('Error sending test request. Please try again.');
      }
    });
  }
}
