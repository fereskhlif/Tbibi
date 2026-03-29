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
  priority?: string;
  prescribedByDoctorName?: string;
  laboratoryUserName?: string;
  notificationMessage?: string;
  expanded?: boolean;
  showExplanation?: boolean;
}

interface Notification {
  notificationId: number;
  message: string;
  read: boolean;
  createdDate: string;
}

@Component({
  selector: 'app-lab-results',
  templateUrl: './lab-results.component.html',
  styleUrls: ['./lab-results.component.css']
})
export class LabResultsComponent implements OnInit {
  results: LaboratoryResult[] = [];
  notifications: Notification[] = [];
  unreadCount: number = 0;
  currentUserId: number = 6; // Patient ID par défaut

  // ✅ CORRIGÉ - URL complète avec /laboratory-results
  private apiUrl = 'http://localhost:8088/api/laboratory-results';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLabResults();
    this.loadNotifications();
  }

  loadLabResults() {
    console.log('Loading lab results for patient:', this.currentUserId);
    
    this.http.get<LaboratoryResult[]>(`${this.apiUrl}/patient/${this.currentUserId}`)
      .subscribe({
        next: (data: LaboratoryResult[]) => {
          console.log('Lab results loaded successfully:', data);
          this.results = data.map(result => ({ 
            ...result, 
            expanded: false,
            showExplanation: false 
          }));
          
          // ✅ Check for critical results and show alert
          this.checkForCriticalResults(data);
        },
        error: (err: any) => {
          console.error('Error loading lab results:', err);
        }
      });
  }

  // ✅ Check for critical results and alert patient
  checkForCriticalResults(results: LaboratoryResult[]) {
    const criticalResults = results.filter(r => 
      r.priority === 'Critical' && 
      (r.status === 'Completed' || r.status === 'Validated')
    );
    
    if (criticalResults.length > 0) {
      const message = criticalResults.length === 1
        ? `⚠️ CRITICAL ALERT: You have 1 critical test result that requires immediate attention!`
        : `⚠️ CRITICAL ALERT: You have ${criticalResults.length} critical test results that require immediate attention!`;
      
      alert(message + '\n\nPlease contact your doctor immediately.');
    }
  }

  loadNotifications() {
    this.http.get<Notification[]>(`http://localhost:8088/api/notifications/user/${this.currentUserId}`)
      .subscribe({
        next: (data: Notification[]) => {
          this.notifications = data;
          this.updateUnreadCount();
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

  toggleResult(result: LaboratoryResult) {
    result.expanded = !result.expanded;
  }

  // ✅ Toggle simple explanation
  toggleExplanation(result: LaboratoryResult) {
    result.showExplanation = !result.showExplanation;
  }

  // ✅ Get simple explanation for test results
  getSimpleExplanation(result: LaboratoryResult): string {
    const testType = result.testName.toLowerCase();
    
    if (testType.includes('blood') || testType.includes('hemoglobin') || testType.includes('cbc')) {
      return `This blood test checks your overall health by measuring different components in your blood. 
              Normal results mean your blood cells are healthy. High or low values may indicate anemia, 
              infection, or other conditions. Your doctor will explain any abnormal results.`;
    }
    
    if (testType.includes('glucose') || testType.includes('sugar')) {
      return `This test measures the sugar (glucose) level in your blood. Normal levels indicate good blood 
              sugar control. High levels may suggest diabetes or prediabetes. Low levels can cause dizziness 
              and weakness. Consult your doctor about the results.`;
    }
    
    if (testType.includes('cholesterol') || testType.includes('lipid')) {
      return `This test measures fats in your blood including cholesterol. Normal levels reduce heart disease 
              risk. High cholesterol can lead to heart problems. Your doctor may recommend diet changes or 
              medication if levels are high.`;
    }
    
    if (testType.includes('urine') || testType.includes('urinalysis')) {
      return `This test examines your urine for signs of kidney problems, infections, or diabetes. Normal 
              results mean your kidneys are working well. Abnormal results may require further testing.`;
    }
    
    return `This test helps your doctor understand your health condition. Normal results are good news. 
            If any values are outside the normal range, your doctor will discuss what this means and 
            any necessary next steps. Don't hesitate to ask questions!`;
  }

  // ✅ Check if result has abnormal values
  hasAbnormalValues(resultValue: string): boolean {
    const lower = resultValue.toLowerCase();
    return lower.includes('high') || lower.includes('low') || 
           lower.includes('abnormal') || lower.includes('critical');
  }

  // ✅ Share result with doctor
  shareWithDoctor(result: LaboratoryResult) {
    if (!result.prescribedByDoctorName) {
      alert('No prescribing doctor assigned to this result.');
      return;
    }
    
    const confirmed = confirm(
      `Share this result with Dr. ${result.prescribedByDoctorName}?\n\n` +
      `Test: ${result.testName}\n` +
      `Status: ${result.status}\n\n` +
      `The doctor will be notified and can view your results securely.`
    );
    
    if (confirmed) {
      // In a real app, this would call an API endpoint
      alert(`✅ Result shared successfully with Dr. ${result.prescribedByDoctorName}!\n\nYour doctor has been notified and can now access this result.`);
    }
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Completed': 'status-completed',
      'Pending': 'status-pending',
      'In Progress': 'status-progress',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  }

  downloadAll() {
    alert('Downloading all lab results as a ZIP archive...');
  }

  downloadResult(result: LaboratoryResult) {
    alert(`Downloading PDF report for ${result.testName}...`);
  }
}
