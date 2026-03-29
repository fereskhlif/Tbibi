import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentService, AppointmentResponse, Doctor, ScheduleSlot } from '../../services/appointment.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('AppointmentsComponent', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;
  let mockService: jasmine.SpyObj<AppointmentService>;

  const mockAppointments: AppointmentResponse[] = [
    { appointmentId: 1, userId: 1, scheduleId: 10, statusAppointement: 'PENDING', doctor: 'Dr. Smith', specialty: 'Cardiology', service: 'Cardiology', reasonForVisit: 'Checkup', scheduleDate: '2026-05-01', scheduleTime: [10, 0] as any, patientName: '', meetingLink: '' },
    { appointmentId: 2, userId: 1, scheduleId: 11, statusAppointement: 'CANCELLED', doctor: 'Dr. Jones', specialty: 'Neurology', service: 'Neurology', reasonForVisit: 'Headache', scheduleDate: '2026-05-02', scheduleTime: [11, 0] as any, patientName: '', meetingLink: '' }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('AppointmentService', [
      'getPatientAppointments',
      'getSpecialties',
      'getDoctorsBySpecialty',
      'getAvailableSchedules',
      'createAppointment',
      'cancelAppointment',
      'deleteAppointment',
      'updateAppointmentStatus'
    ]);

    mockService.getPatientAppointments.and.returnValue(of(JSON.parse(JSON.stringify(mockAppointments))));
    mockService.getSpecialties.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ AppointmentsComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: AppointmentService, useValue: mockService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
    spyOn(localStorage, 'getItem').and.returnValue('1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patient appointments on init', () => {
    expect(mockService.getPatientAppointments).toHaveBeenCalledWith(1);
    expect(component.myAppointments.length).toBe(2);
    expect(component.loadingList).toBeFalse();
  });

  it('should filter upcoming appointments correctly', () => {
    const upcoming = component.upcomingAppointments;
    expect(upcoming.length).toBe(1);
    expect(upcoming[0].statusAppointement).toBe('PENDING');
  });

  it('should open new appointment modal and load specialties', () => {
    mockService.getSpecialties.and.returnValue(of(['Cardiology', 'Neurology']));
    component.openNewModal();
    
    expect(component.showNewModal).toBeTrue();
    expect(mockService.getSpecialties).toHaveBeenCalled();
    expect(component.specialties.length).toBe(2);
    expect(component.step).toBe(1);
  });

  it('should navigate steps and book appointment', fakeAsync(() => {
    component.openNewModal();
    
    component.selectedSpecialty = 'Cardiology';
    expect(component.canProceed()).toBeTrue();
    
    mockService.getDoctorsBySpecialty.and.returnValue(of([{ userId: 2, name: 'Smith', adresse: '', bio: '', specialty: 'Cardiology', specialties: [], consultations: [] }]));
    component.nextStep(); // to step 2
    
    expect(component.step).toBe(2);
    expect(mockService.getDoctorsBySpecialty).toHaveBeenCalledWith('Cardiology');
    
    component.selectedDoctorId = 2;
    component.nextStep(); // to step 3
    
    expect(component.step).toBe(3);
    component.reasonForVisit = 'Chest pain';
    
    const mockSlots: ScheduleSlot[] = [
      { scheduleId: 10, doctorId: 2, doctorName: 'Dr. Smith', date: '2026-05-10', startTime: '10:00:00', isAvailable: true }
    ];
    mockService.getAvailableSchedules.and.returnValue(of(mockSlots));
    
    component.nextStep(); // to step 4
    
    expect(component.step).toBe(4);
    expect(mockService.getAvailableSchedules).toHaveBeenCalledWith(2);
    
    component.selectSlot(mockSlots[0]);
    expect(component.selectedSlot).toEqual(mockSlots[0]);
    
    mockService.createAppointment.and.returnValue(of({} as any));
    component.bookAppointment();
    tick(); // resolve observable
    
    expect(mockService.createAppointment).toHaveBeenCalled();
    expect(component.showNewModal).toBeFalse();
    expect(component.showSuccess).toBeTrue();
    tick(3500);
  }));

  it('should cancel appointment', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockService.cancelAppointment.and.returnValue(of(null as any));
    const aptToCancel = component.myAppointments[0];
    
    component.cancelApt(aptToCancel);
    tick();
    
    expect(mockService.cancelAppointment).toHaveBeenCalledWith(aptToCancel.appointmentId);
    expect(mockService.getPatientAppointments).toHaveBeenCalledTimes(2); // once on init, once on cancel
  }));
});
