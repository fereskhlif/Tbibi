import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LabResultsComponent } from './lab-results.component';

describe('LabResultsComponent (Patient)', () => {
  let component: LabResultsComponent;
  let fixture: ComponentFixture<LabResultsComponent>;
  let httpMock: HttpTestingController;

  const mockResults = [
    {
      labId: 1,
      testName: 'Blood Test',
      location: 'Main Lab',
      nameLabo: 'City Lab',
      resultValue: 'Normal',
      status: 'Completed',
      testDate: '2026-03-28',
      priority: 'Normal',
      prescribedByDoctorName: 'Dr. Smith',
      laboratoryUserName: 'Lab Tech'
    },
    {
      labId: 2,
      testName: 'Glucose Test',
      location: 'Main Lab',
      nameLabo: 'City Lab',
      resultValue: 'High - 150 mg/dL',
      status: 'Completed',
      testDate: '2026-03-28',
      priority: 'Critical',
      prescribedByDoctorName: 'Dr. Smith',
      laboratoryUserName: 'Lab Tech'
    }
  ];

  const mockNotifications = [
    {
      notificationId: 1,
      message: 'Your blood test results are ready',
      read: false,
      createdDate: '2026-03-28T10:00:00'
    },
    {
      notificationId: 2,
      message: 'Your glucose test results are ready',
      read: true,
      createdDate: '2026-03-28T11:00:00'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabResultsComponent],
      imports: [HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LabResultsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load lab results and notifications on init', () => {
      component.ngOnInit();

      const labReq = httpMock.expectOne(`${component['apiUrl']}/patient/${component.currentUserId}`);
      expect(labReq.request.method).toBe('GET');
      labReq.flush(mockResults);

      const notifReq = httpMock.expectOne(`http://localhost:8088/api/notifications/user/${component.currentUserId}`);
      expect(notifReq.request.method).toBe('GET');
      notifReq.flush(mockNotifications);

      expect(component.results.length).toBe(2);
      expect(component.notifications.length).toBe(2);
    });

    it('should handle error when loading results', () => {
      spyOn(console, 'error');
      
      component.ngOnInit();

      const labReq = httpMock.expectOne(`${component['apiUrl']}/patient/${component.currentUserId}`);
      labReq.error(new ErrorEvent('Network error'));

      // Flush the notifications request that was also triggered
      const notifReq = httpMock.expectOne(`http://localhost:8088/api/notifications/user/${component.currentUserId}`);
      notifReq.flush([]);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('checkForCriticalResults', () => {
    it('should alert user when critical results are found', () => {
      spyOn(window, 'alert');
      
      component.checkForCriticalResults(mockResults);
      
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('CRITICAL ALERT'));
    });

    it('should not alert when no critical results', () => {
      spyOn(window, 'alert');
      const normalResults = [mockResults[0]];
      
      component.checkForCriticalResults(normalResults);
      
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('loadNotifications', () => {
    it('should load notifications successfully', () => {
      component.loadNotifications();

      const req = httpMock.expectOne(`http://localhost:8088/api/notifications/user/${component.currentUserId}`);
      req.flush(mockNotifications);

      expect(component.notifications.length).toBe(2);
      expect(component.unreadCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle notification loading error gracefully', () => {
      spyOn(console, 'warn');
      
      component.loadNotifications();

      const req = httpMock.expectOne(`http://localhost:8088/api/notifications/user/${component.currentUserId}`);
      req.error(new ErrorEvent('Network error'));

      expect(component.notifications.length).toBe(0);
      expect(component.unreadCount).toBe(0);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', () => {
      const notification = { 
        notificationId: 1, 
        message: 'Test notification', 
        read: false,  // ✅ Explicitly set to false
        createdDate: '2026-03-28T10:00:00' 
      };
      
      component.markNotificationAsRead(notification);

      const req = httpMock.expectOne(`http://localhost:8088/api/notifications/${notification.notificationId}/read`);
      expect(req.request.method).toBe('PUT');
      req.flush({});

      expect(notification.read).toBe(true);
    });

    it('should not make request if already read', () => {
      const notification = { 
        notificationId: 1, 
        message: 'Test notification', 
        read: true,  // ✅ Explicitly set to true
        createdDate: '2026-03-28T10:00:00' 
      };
      
      component.markNotificationAsRead(notification);

      httpMock.expectNone(`http://localhost:8088/api/notifications/${notification.notificationId}/read`);
      expect(notification.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      component.notifications = [...mockNotifications];
      
      component.markAllAsRead();

      const req = httpMock.expectOne(`http://localhost:8088/api/notifications/user/${component.currentUserId}/read-all`);
      expect(req.request.method).toBe('PUT');
      req.flush({});

      expect(component.notifications.every(n => n.read)).toBe(true);
    });
  });

  describe('toggleResult', () => {
    it('should toggle result expansion', () => {
      const result = { ...mockResults[0], expanded: false };
      
      component.toggleResult(result);
      expect(result.expanded).toBe(true);
      
      component.toggleResult(result);
      expect(result.expanded).toBe(false);
    });
  });

  describe('toggleExplanation', () => {
    it('should toggle explanation visibility', () => {
      const result = { ...mockResults[0], showExplanation: false };
      
      component.toggleExplanation(result);
      expect(result.showExplanation).toBe(true);
      
      component.toggleExplanation(result);
      expect(result.showExplanation).toBe(false);
    });
  });

  describe('getSimpleExplanation', () => {
    it('should return blood test explanation', () => {
      const result = { ...mockResults[0], testName: 'Blood Test' };
      
      const explanation = component.getSimpleExplanation(result);
      
      expect(explanation).toContain('blood test');
      expect(explanation).toContain('blood cells');
    });

    it('should return glucose test explanation', () => {
      const result = { ...mockResults[0], testName: 'Glucose Test' };
      
      const explanation = component.getSimpleExplanation(result);
      
      expect(explanation.toLowerCase()).toContain('glucose');
      expect(explanation.toLowerCase()).toContain('blood');
    });

    it('should return cholesterol test explanation', () => {
      const result = { ...mockResults[0], testName: 'Cholesterol Test' };
      
      const explanation = component.getSimpleExplanation(result);
      
      expect(explanation).toContain('cholesterol');
      expect(explanation).toContain('heart');
    });

    it('should return urine test explanation', () => {
      const result = { ...mockResults[0], testName: 'Urine Test' };
      
      const explanation = component.getSimpleExplanation(result);
      
      expect(explanation).toContain('urine');
      expect(explanation).toContain('kidney');
    });

    it('should return generic explanation for unknown test', () => {
      const result = { ...mockResults[0], testName: 'Unknown Test' };
      
      const explanation = component.getSimpleExplanation(result);
      
      expect(explanation).toContain('doctor');
      expect(explanation).toContain('health');
    });
  });

  describe('hasAbnormalValues', () => {
    it('should detect high values', () => {
      expect(component.hasAbnormalValues('High - 150 mg/dL')).toBe(true);
    });

    it('should detect low values', () => {
      expect(component.hasAbnormalValues('Low - 50 mg/dL')).toBe(true);
    });

    it('should detect abnormal values', () => {
      expect(component.hasAbnormalValues('Abnormal result')).toBe(true);
    });

    it('should detect critical values', () => {
      expect(component.hasAbnormalValues('Critical level')).toBe(true);
    });

    it('should return false for normal values', () => {
      expect(component.hasAbnormalValues('Normal range')).toBe(false);
    });
  });

  describe('shareWithDoctor', () => {
    it('should share result with doctor after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      const result = mockResults[0];
      
      component.shareWithDoctor(result);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('shared successfully'));
    });

    it('should not share if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(window, 'alert');
      const result = mockResults[0];
      
      component.shareWithDoctor(result);
      
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should alert if no doctor assigned', () => {
      spyOn(window, 'alert');
      const result = { ...mockResults[0], prescribedByDoctorName: undefined };
      
      component.shareWithDoctor(result);
      
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('No prescribing doctor'));
    });
  });

  describe('getStatusClass', () => {
    it('should return correct CSS class for status', () => {
      expect(component.getStatusClass('Completed')).toBe('status-completed');
      expect(component.getStatusClass('Pending')).toBe('status-pending');
      expect(component.getStatusClass('In Progress')).toBe('status-progress');
      expect(component.getStatusClass('Cancelled')).toBe('status-cancelled');
      expect(component.getStatusClass('Unknown')).toBe('status-default');
    });
  });

  describe('downloadAll', () => {
    it('should show download all alert', () => {
      spyOn(window, 'alert');
      
      component.downloadAll();
      
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Downloading all'));
    });
  });

  describe('downloadResult', () => {
    it('should show download result alert', () => {
      spyOn(window, 'alert');
      const result = mockResults[0];
      
      component.downloadResult(result);
      
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Blood Test'));
    });
  });
});
