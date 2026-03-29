import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChronicDiseaseComponent } from './chronic-disease.component';
import { ChronicConditionService, ChronicConditionResponse } from '../../services/chronic-condition.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('ChronicDiseaseComponent', () => {
  let component: ChronicDiseaseComponent;
  let fixture: ComponentFixture<ChronicDiseaseComponent>;
  let mockService: jasmine.SpyObj<ChronicConditionService>;
  let mockHttp: jasmine.SpyObj<HttpClient>;

  const mockRecords: ChronicConditionResponse[] = [
    { id: 1, doctorId: 2, patientId: 1, conditionType: 'BLOOD_SUGAR', value: 130, unit: 'mg/dL', severity: 'CRITICAL', patientName: 'John', displayValue: '130 mg/dL', notes: 'High sugar', recordedAt: '2026-05-01T10:00:00' },
    { id: 2, doctorId: 2, patientId: 1, conditionType: 'HEART_RATE', value: 75, unit: 'bpm', severity: 'NORMAL', patientName: 'John', displayValue: '75 bpm', notes: '', recordedAt: '2026-05-02T10:00:00' }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ChronicConditionService', ['getByDoctor', 'delete', 'create']);
    mockService.getByDoctor.and.returnValue(of(mockRecords));
    mockService.delete.and.returnValue(of({} as any));
    mockService.create.and.returnValue(of({} as any));

    mockHttp = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    mockHttp.get.and.returnValue(of([{ userId: 1, name: 'John', email: 'john@doc.com' }]));
    mockHttp.post.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [ ChronicDiseaseComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: ChronicConditionService, useValue: mockService },
        { provide: HttpClient, useValue: mockHttp }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.returnValue('2');
    fixture = TestBed.createComponent(ChronicDiseaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create and load data', () => {
    expect(component).toBeTruthy();
    expect(mockService.getByDoctor).toHaveBeenCalledWith(2);
    expect(component.records.length).toBe(2);
    expect(component.patients.length).toBe(1);
  });

  it('should filter records', () => {
    component.activeFilter = 'CRITICAL';
    expect(component.filteredRecords.length).toBe(1);
    expect(component.filteredRecords[0].conditionType).toBe('BLOOD_SUGAR');

    component.activeFilter = 'BLOOD_SUGAR';
    expect(component.filteredRecords.length).toBe(1);

    component.activeFilter = 'ALL';
    expect(component.filteredRecords.length).toBe(2);
  });

  it('should format directions correctly', () => {
    expect(component.vitalDirection({ type: 'BLOOD_SUGAR', value: 65, severity: 'CRITICAL' } as any)).toContain('LOW');
    expect(component.vitalDirection({ type: 'HEART_RATE', value: 125, severity: 'CRITICAL' } as any)).toContain('HIGH');
  });

  it('should delete a record', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteRecord(1);
    expect(mockService.delete).toHaveBeenCalledWith(1);
  });

  it('should compute severity correctly', () => {
    expect(component.computeSeverity('BLOOD_SUGAR', 65)).toBe('CRITICAL');
    expect(component.computeSeverity('BLOOD_PRESSURE', 125)).toBe('WARNING');
    expect(component.computeSeverity('HEART_RATE', 70)).toBe('NORMAL');
  });

  it('should handle monitoring and emit events on critical readings', fakeAsync(() => {
    component.selectedPatient = { id: 1, name: 'John' };
    
    spyOn(component as any, 'generateReading').and.callFake((type: string) => {
        if (type === 'HEART_RATE') return { val: 140 }; // CRITICAL
        return { val: 100 };
    });

    component.startMonitor();
    expect(component.monitoring).toBeTrue();

    // The component should save the reading via Service and post to email API
    expect(mockHttp.post).toHaveBeenCalled(); // Email sent
    
    tick(3500); // clear any timeouts from alerts
    component.stopMonitor();

    // Verify it saved a critical reading
    const calls = mockHttp.post.calls.allArgs();
    const hasEmailCall = calls.some(args => String(args[0]).includes('warn-email'));
    expect(hasEmailCall).toBeTrue();
  }));
});
