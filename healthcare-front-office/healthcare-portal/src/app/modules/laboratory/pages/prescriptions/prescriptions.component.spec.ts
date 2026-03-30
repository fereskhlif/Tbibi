import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabPrescriptionsComponent } from './prescriptions.component';
import { PrescriptionService, PrescriptionResponse } from '../../../../services/prescription-service.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('LabPrescriptionsComponent', () => {
  let component: LabPrescriptionsComponent;
  let fixture: ComponentFixture<LabPrescriptionsComponent>;
  let mockPrescriptionService: jasmine.SpyObj<PrescriptionService>;

  const mockPrescriptions: PrescriptionResponse[] = [
    {
      prescriptionID: 1,
      patientId: 101,
      patientName: 'John Doe',
      doctorId: 201,
      doctorName: 'Dr. Smith',
      date: '2026-10-10',
      status: 'PENDING',
      acteType: 'ANALYSE_DIAGNOSTIQUE',
      note: 'test note',
      statusUpdatedAt: '2026-10-10',
      medicines: []
    },
    {
      prescriptionID: 2,
      patientId: 102,
      patientName: 'Jane Doe',
      doctorId: 202,
      doctorName: 'Dr. House',
      date: '2026-10-11',
      status: 'VALIDATED',
      acteType: 'ANALYSE_MICROBIOLOGIQUE',
      note: 'another note',
      statusUpdatedAt: '2026-10-11',
      medicines: []
    }
  ];

  beforeEach(async () => {
    mockPrescriptionService = jasmine.createSpyObj('PrescriptionService', ['getAnalysisPrescriptions', 'updateStatus']);
    mockPrescriptionService.getAnalysisPrescriptions.and.returnValue(of(mockPrescriptions));

    await TestBed.configureTestingModule({
      declarations: [ LabPrescriptionsComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: PrescriptionService, useValue: mockPrescriptionService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabPrescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load prescriptions on init', () => {
    expect(mockPrescriptionService.getAnalysisPrescriptions).toHaveBeenCalled();
    expect(component.prescriptions.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should filter prescriptions by type', () => {
    component.activeTypeFilter = 'ANALYSE_DIAGNOSTIQUE';
    expect(component.filtered.length).toBe(1);
    expect(component.filtered[0].prescriptionID).toBe(1);

    component.activeTypeFilter = 'ANALYSE_MICROBIOLOGIQUE';
    expect(component.filtered.length).toBe(1);
    expect(component.filtered[0].prescriptionID).toBe(2);

    component.activeTypeFilter = 'ALL';
    expect(component.filtered.length).toBe(2);
  });

  it('should filter prescriptions by status', () => {
    component.activeStatusFilter = 'PENDING';
    expect(component.filtered.length).toBe(1);
    expect(component.filtered[0].prescriptionID).toBe(1);

    component.activeStatusFilter = 'VALIDATED';
    expect(component.filtered.length).toBe(1);
    expect(component.filtered[0].prescriptionID).toBe(2);

    component.activeStatusFilter = 'ALL';
    expect(component.filtered.length).toBe(2);
  });

  it('should handle error when loading prescriptions', () => {
    mockPrescriptionService.getAnalysisPrescriptions.and.returnValue(throwError(() => new Error('Error')));
    component.load();
    expect(component.error).toBe("Erreur lors du chargement des prescriptions d'analyse.");
    expect(component.loading).toBeFalse();
  });

  it('should update status calling the API', () => {
    const rx = component.prescriptions[0];
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
    
    mockPrescriptionService.updateStatus.and.returnValue(of({ ...rx, status: 'VALIDATED' }));
    
    component.updateStatus(rx, 'VALIDATED', event);
    
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockPrescriptionService.updateStatus).toHaveBeenCalledWith(1, 'VALIDATED');
    expect(component.prescriptions[0].status).toBe('VALIDATED');
    expect(component.prescriptions[0].expanded).toBeTrue();
  });

  it('should count prescriptions by type', () => {
    expect(component.countByType('ANALYSE_DIAGNOSTIQUE')).toBe(1);
    expect(component.countByType('ANALYSE_MICROBIOLOGIQUE')).toBe(1);
    expect(component.countByType('TEST_GENETIQUE')).toBe(0);
  });

  it('should count prescriptions by status', () => {
    expect(component.countByStatus('PENDING')).toBe(1);
    expect(component.countByStatus('VALIDATED')).toBe(1);
    expect(component.countByStatus('COMPLETED')).toBe(0);
  });
});
