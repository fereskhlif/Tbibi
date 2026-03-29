import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DoctorAllAppointmentsComponent } from './all-appointments.component';
import { DoctorAppointmentService } from '../../services/doctor-appointment.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AppointmentResponse } from '../../../patient/services/appointment.service';

describe('DoctorAllAppointmentsComponent', () => {
  let component: DoctorAllAppointmentsComponent;
  let fixture: ComponentFixture<DoctorAllAppointmentsComponent>;
  let mockService: jasmine.SpyObj<DoctorAppointmentService>;

  const mockAppointments: AppointmentResponse[] = [
    { appointmentId: 1, userId: 1, scheduleId: 10, statusAppointement: 'PENDING', doctor: 'Dr. Smith', specialty: 'Cardiology', service: 'Cardiology', reasonForVisit: 'Checkup', scheduleDate: '2026-04-01', scheduleTime: [10, 0] as any, patientName: 'John Doe', meetingLink: '' },
    { appointmentId: 2, userId: 1, scheduleId: 11, statusAppointement: 'CONFIRMED', doctor: 'Dr. Smith', specialty: 'Cardiology', service: 'Cardiology', reasonForVisit: 'Follow up', scheduleDate: '2026-04-02', scheduleTime: [11, 0] as any, patientName: 'Jane Smith', meetingLink: '' }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('DoctorAppointmentService', ['getDoctorAppointments', 'confirm', 'refuse', 'delete', 'reschedule']);
    mockService.getDoctorAppointments.and.returnValue(of(JSON.parse(JSON.stringify(mockAppointments))));

    await TestBed.configureTestingModule({
      declarations: [ DoctorAllAppointmentsComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: DoctorAppointmentService, useValue: mockService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorAllAppointmentsComponent);
    component = fixture.componentInstance;
    spyOn(localStorage, 'getItem').and.returnValue('2');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments on init', () => {
    expect(mockService.getDoctorAppointments).toHaveBeenCalledWith(2);
    expect(component.appointments.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should filter appointments by status', () => {
    component.activeFilter = 'CONFIRMED';
    expect(component.filtered.length).toBe(1);
    expect(component.filtered[0].patientName).toBe('Jane Smith');
  });

  it('should call confirm and update status', fakeAsync(() => {
    const aptToConfirm = component.appointments[0];
    const updatedApt = { ...aptToConfirm, statusAppointement: 'CONFIRMED' };
    mockService.confirm.and.returnValue(of(updatedApt));
    
    component.confirm(aptToConfirm);
    tick();
    
    expect(mockService.confirm).toHaveBeenCalledWith(1);
    expect(aptToConfirm.statusAppointement).toBe('CONFIRMED');
    expect(component.successMsg).toBeTruthy();
    tick(3500);
  }));

  it('should open reschedule modal', () => {
    const apt = component.appointments[0];
    component.openReschedule(apt);
    expect(component.rescheduleTarget).toEqual(apt);
    expect(component.rescheduleDate).toBe('');
  });
});
