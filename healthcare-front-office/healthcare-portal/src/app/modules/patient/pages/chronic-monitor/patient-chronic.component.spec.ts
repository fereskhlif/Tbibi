import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PatientChronicComponent } from './patient-chronic.component';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('PatientChronicComponent', () => {
  let component: PatientChronicComponent;
  let fixture: ComponentFixture<PatientChronicComponent>;
  let mockHttp: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    mockHttp = jasmine.createSpyObj('HttpClient', ['post']);
    mockHttp.post.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [ PatientChronicComponent ],
      providers: [
        { provide: HttpClient, useValue: mockHttp }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'userId') return '1';
      if (key === 'userName') return 'John Doe';
      if (key === 'userEmail') return 'john@example.com';
      return null;
    });
    fixture = TestBed.createComponent(PatientChronicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute severity correctly', () => {
    expect(component.computeSeverity('BLOOD_SUGAR', 65)).toBe('CRITICAL');
    expect(component.computeSeverity('BLOOD_SUGAR', 90)).toBe('NORMAL');
    expect(component.computeSeverity('BLOOD_SUGAR', 110)).toBe('WARNING');
    
    expect(component.computeSeverity('HEART_RATE', 35)).toBe('CRITICAL');
    expect(component.computeSeverity('HEART_RATE', 72)).toBe('NORMAL');
    expect(component.computeSeverity('HEART_RATE', 105)).toBe('WARNING');
  });

  it('should determine vital direction correctly', () => {
    let mockVital: any = { type: 'BLOOD_SUGAR', value: 65, severity: 'CRITICAL' };
    expect(component.vitalDirection(mockVital)).toContain('LOW');

    mockVital = { type: 'HEART_RATE', value: 110, severity: 'WARNING' };
    expect(component.vitalDirection(mockVital)).toContain('HIGH');
  });

  it('should start and stop monitoring properly', () => {
    component.startMonitor();
    expect(component.monitoring).toBeTrue();
    // Vitals should not be null anymore since startMonitor runs simulateTick immediately
    expect(component.liveVitals[0].value).not.toBeNull();

    component.stopMonitor();
    expect(component.monitoring).toBeFalse();
  });

  it('should simulate ticks and call email API on warning', fakeAsync(() => {
    // Override the generator to guarantee a WARNING roll
    spyOn(component as any, 'generateReading').and.callFake((type: string) => {
      switch (type) {
        case 'BLOOD_SUGAR': return { val: 110 }; // WARNING
        case 'HEART_RATE': return { val: 70 }; // NORMAL
        default: return { val: 100 };
      }
    });

    component.startMonitor(); // initial tick
    
    // Check if post was called because of BLOOD_SUGAR warning
    expect(mockHttp.post).toHaveBeenCalled();
    expect((component as any).warnEmailSent.has('BLOOD_SUGAR')).toBeTrue();
    
    // Move time forward
    tick(3000);
    
    // It shouldn't trigger another email for BLOOD_SUGAR because of warnEmailSent tracking
    expect(mockHttp.post).toHaveBeenCalledTimes(1);

    component.stopMonitor();
  }));
});
