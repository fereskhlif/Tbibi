import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BookAppointmentComponent } from './book-appointment.component';
import { AppointmentService, Doctor, ScheduleSlot } from '../../services/appointment.service';

describe('BookAppointmentComponent', () => {
  let component: BookAppointmentComponent;
  let fixture: ComponentFixture<BookAppointmentComponent>;
  let mockAppointmentService: any;

  beforeEach(async () => {
    mockAppointmentService = {
      getSpecialties: jasmine.createSpy().and.returnValue(of(['Cardiology', 'Neurology'])),
      getDoctorsBySpecialty: jasmine.createSpy().and.returnValue(of([])),
      getDoctorsByName: jasmine.createSpy().and.returnValue(of([])),
      getAvailableSchedules: jasmine.createSpy().and.returnValue(of([])),
      sendVerification: jasmine.createSpy().and.returnValue(of({ verificationId: 'v123' })),
      validateAndConfirm: jasmine.createSpy().and.returnValue(of({ appointmentId: 100 }))
    };

    await TestBed.configureTestingModule({
      declarations: [ BookAppointmentComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: AppointmentService, useValue: mockAppointmentService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookAppointmentComponent);
    component = fixture.componentInstance;
    
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'UserName') return 'John Doe';
      if (key === 'EmailUserConnect') return 'john@example.com';
      if (key === 'userId') return '1';
      return null;
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Validation - canProceedVerification', () => {
    it('should return false if name is empty', () => {
      component.patientName = '  ';
      component.patientEmail = 'test@example.com';
      expect(component.canProceedVerification()).toBeFalse();
    });

    it('should return false if email is invalid', () => {
      component.patientName = 'John';
      component.patientEmail = 'invalid-email';
      expect(component.canProceedVerification()).toBeFalse();
    });

    it('should return true if name and valid email are provided', () => {
      component.patientName = 'John Doe';
      component.patientEmail = 'test@example.com';
      expect(component.canProceedVerification()).toBeTrue();
    });
  });

  describe('goToVerification', () => {
    it('should transition to step 1 and read identity from localStorage', () => {
      // Setup selected slot to pass canProceedDateHeure()
      component.selectedSlot = { scheduleId: 10, date: '2025-01-01', startTime: '09:00', endTime: '09:30', isAvailable: true } as any;
      component.reasonForVisit = 'Checkup';
      
      component.goToVerification();

      expect(component.currentStep).toBe(1);
      expect(component.patientName).toBe('John Doe');
      expect(localStorage.getItem).toHaveBeenCalledWith('UserName');
      expect(localStorage.getItem).toHaveBeenCalledWith('EmailUserConnect');
    });
  });

  describe('sendVerificationCode', () => {
    it('should call AppointmentService.sendVerification and move to step 2 on success', () => {
      component.patientName = 'John Doe';
      component.patientEmail = 'test@example.com';
      component.selectedSlot = { scheduleId: 10, date: '2025-01-01', startTime: '09:00', endTime: '09:30', isAvailable: true } as any;
      component.selectedDoctor = { userId: 2, name: 'Smith', email: '', role: 'DOCTOR', specialty: 'Cardiology' } as any;
      component.reasonForVisit = 'Checkup';

      component.sendVerificationCode();

      expect(component.sendingCode).toBeFalse();
      expect(mockAppointmentService.sendVerification).toHaveBeenCalled();
      expect(component.currentStep).toBe(2);
      expect(component.verificationId).toBe('v123');
    });

    it('should handle error and stay on step 1', () => {
      mockAppointmentService.sendVerification.and.returnValue(throwError(() => ({ error: { message: 'Network error' } })));
      
      component.patientName = 'John Doe';
      component.patientEmail = 'test@example.com';
      component.selectedSlot = { scheduleId: 10, date: '2025-01-01', startTime: '09:00', endTime: '09:30', isAvailable: true } as any;
      component.selectedDoctor = { userId: 2, name: 'Smith', email: '', role: 'DOCTOR', specialty: 'Cardiology' } as any;
      component.reasonForVisit = 'Checkup';

      component.currentStep = 1;

      component.sendVerificationCode();

      expect(component.sendingCode).toBeFalse();
      expect(component.currentStep).toBe(1);
      expect(component.verificationError).toBe('Network error');
    });
  });
});
