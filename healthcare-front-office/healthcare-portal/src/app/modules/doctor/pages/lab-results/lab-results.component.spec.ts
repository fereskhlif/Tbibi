import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DoctorLabResultsComponent } from './lab-results.component';

describe('DoctorLabResultsComponent', () => {
  let component: DoctorLabResultsComponent;
  let fixture: ComponentFixture<DoctorLabResultsComponent>;
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
      patient: {
        userId: 6,
        name: 'John Doe'
      }
    },
    {
      labId: 2,
      testName: 'Glucose Test',
      location: 'Main Lab',
      nameLabo: 'City Lab',
      resultValue: 'High',
      status: 'Pending',
      testDate: '2026-03-28',
      patient: {
        userId: 6,
        name: 'John Doe'
      }
    }
  ];

  const mockNotifications = [
    {
      notificationId: 1,
      message: 'Lab result ready for patient John Doe',
      read: false,
      createdDate: '2026-03-28T10:00:00'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DoctorLabResultsComponent],
      imports: [HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorLabResultsComponent);
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

      const labReq = httpMock.expectOne(`${component['apiUrl']}/doctor/${component.currentUserId}`);
      expect(labReq.request.method).toBe('GET');
      labReq.flush(mockResults);

      const notifReq = httpMock.expectOne(`http://localhost:8088/api/notifications/user/${component.currentUserId}`);
      expect(notifReq.request.method).toBe('GET');
      notifReq.flush(mockNotifications);

      expect(component.results.length).toBe(2);
      expect(component.notifications.length).toBe(1);
    });

    it('should handle error when loading results', () => {
      spyOn(console, 'error');
      
      component.ngOnInit();

      const labReq = httpMock.expectOne(`${component['apiUrl']}/doctor/${component.currentUserId}`);
      labReq.error(new ErrorEvent('Network error'));

      // Flush the notifications request that was also triggered
      const notifReq = httpMock.expectOne(`http://localhost:8088/api/notifications/user/${component.currentUserId}`);
      notifReq.flush([]);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadNotifications', () => {
    it('should load notifications successfully', () => {
      component.loadNotifications();

      const req = httpMock.expectOne(`http://localhost:8088/api/notifications/user/${component.currentUserId}`);
      req.flush(mockNotifications);

      expect(component.notifications.length).toBe(1);
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

  describe('getStatusClass', () => {
    it('should return correct CSS class for status', () => {
      expect(component.getStatusClass('Completed')).toBe('bg-green-100 text-green-700');
      expect(component.getStatusClass('Pending')).toBe('bg-yellow-100 text-yellow-700');
      expect(component.getStatusClass('In Progress')).toBe('bg-blue-100 text-blue-700');
      expect(component.getStatusClass('Cancelled')).toBe('bg-red-100 text-red-700');
      expect(component.getStatusClass('Unknown')).toBe('bg-gray-100 text-gray-700');
    });
  });

  describe('reviewResult', () => {
    it('should show review alert', () => {
      spyOn(window, 'alert');
      const result = mockResults[0];
      
      component.reviewResult(result);
      
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Blood Test'));
    });
  });

  describe('openRequestForm', () => {
    it('should open request form with empty data', () => {
      component.openRequestForm();
      
      expect(component.showRequestForm).toBe(true);
      expect(component.requestForm.patientId).toBeNull();
      expect(component.requestForm.testName).toBe('');
      expect(component.requestForm.priority).toBe('Normal');
    });
  });

  describe('closeRequestForm', () => {
    it('should close request form', () => {
      component.showRequestForm = true;
      
      component.closeRequestForm();
      
      expect(component.showRequestForm).toBe(false);
    });
  });

  describe('submitTestRequest', () => {
    beforeEach(() => {
      component.requestForm = {
        patientId: 6,
        testName: 'Blood Test',
        priority: 'Urgent',
        requestNotes: 'Follow-up test'
      };
    });

    it('should submit test request successfully', () => {
      spyOn(window, 'alert');
      
      component.submitTestRequest();

      const req = httpMock.expectOne(`${component['apiUrl']}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.testName).toBe('Blood Test');
      expect(req.request.body.priority).toBe('Urgent');
      expect(req.request.body.prescribedByDoctorId).toBe(component.currentUserId);
      req.flush({});

      // Flush the reload request after successful submission
      const reloadReq = httpMock.expectOne(`${component['apiUrl']}/doctor/${component.currentUserId}`);
      reloadReq.flush(mockResults);

      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('successfully'));
      expect(component.showRequestForm).toBe(false);
    });

    it('should show error if patientId is missing', () => {
      spyOn(window, 'alert');
      component.requestForm.patientId = null;
      
      component.submitTestRequest();

      httpMock.expectNone(`${component['apiUrl']}`);
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Patient ID'));
    });

    it('should show error if testName is missing', () => {
      spyOn(window, 'alert');
      component.requestForm.testName = '';
      
      component.submitTestRequest();

      httpMock.expectNone(`${component['apiUrl']}`);
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Test Name'));
    });

    it('should handle request error', () => {
      spyOn(window, 'alert');
      spyOn(console, 'error');
      
      component.submitTestRequest();

      const req = httpMock.expectOne(`${component['apiUrl']}`);
      req.error(new ErrorEvent('Network error'));

      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Error'));
    });
  });

  describe('updateUnreadCount', () => {
    it('should count unread notifications', () => {
      component.notifications = [
        { ...mockNotifications[0], read: false },
        { ...mockNotifications[0], notificationId: 2, read: false },
        { ...mockNotifications[0], notificationId: 3, read: true }
      ];
      
      component.updateUnreadCount();
      
      expect(component.unreadCount).toBe(2);
    });

    it('should return 0 when all notifications are read', () => {
      component.notifications = [
        { ...mockNotifications[0], read: true }
      ];
      
      component.updateUnreadCount();
      
      expect(component.unreadCount).toBe(0);
    });
  });
});
