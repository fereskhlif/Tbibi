import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { PatientProgressComponent } from './patient-progress.component';
import { TherapySessionService } from '../../services/therapy-session.service';

describe('PatientProgressComponent', () => {
  let component: PatientProgressComponent;
  let fixture: ComponentFixture<PatientProgressComponent>;
  let mockService: jasmine.SpyObj<TherapySessionService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('TherapySessionService', ['getByPhysiotherapist']);
    mockService.getByPhysiotherapist.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [PatientProgressComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [{ provide: TherapySessionService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientProgressComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get progress color', () => {
    expect(component.getProgressColor(90)).toBe('#10b981');
    expect(component.getProgressColor(60)).toBe('#3b82f6');
    expect(component.getProgressColor(40)).toBe('#f59e0b');
    expect(component.getProgressColor(20)).toBe('#ef4444');
  });

  it('should get status badge class', () => {
    expect(component.getStatusBadgeClass('Active')).toContain('bg-green-100');
    expect(component.getStatusBadgeClass('Completed')).toContain('bg-blue-100');
    expect(component.getStatusBadgeClass('Inactive')).toContain('bg-gray-100');
  });

  it('should calculate average progress', () => {
    const result = component.getAverageProgress();
    expect(result).toBeDefined();
  });
});
