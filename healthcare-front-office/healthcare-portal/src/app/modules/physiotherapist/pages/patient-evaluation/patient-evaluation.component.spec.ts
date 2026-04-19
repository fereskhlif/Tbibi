import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { PatientEvaluationComponent } from './patient-evaluation.component';
import { PatientEvaluationService } from '../../services/patient-evaluation.service';
import { PatientEvaluation } from '../../models/patient-evaluation.model';

describe('PatientEvaluationComponent', () => {
  let component: PatientEvaluationComponent;
  let fixture: ComponentFixture<PatientEvaluationComponent>;
  let mockService: jasmine.SpyObj<PatientEvaluationService>;

  const mockEvaluations: PatientEvaluation[] = [{
    evaluationId: 1, painScale: 5, painDescription: 'Test', flexionDegrees: 90,
    extensionDegrees: 45, jointLocation: 'Genou', functionalLimitations: 'Test',
    generalObservations: 'Test', treatmentGoals: 'Test', evaluationDate: '2026-03-28',
    patientId: 6, patientName: 'Patient Test', patientEmail: 'test@test.com',
    physiotherapistId: 9, physiotherapistName: 'Physio', createdAt: '', updatedAt: ''
  }];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('PatientEvaluationService', ['getByPhysiotherapist', 'create', 'delete']);
    mockService.getByPhysiotherapist.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [PatientEvaluationComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [{ provide: PatientEvaluationService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientEvaluationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load evaluations', () => {
    mockService.getByPhysiotherapist.and.returnValue(of(mockEvaluations));
    component.ngOnInit();
    expect(component.evaluations.length).toBe(1);
  });

  it('should filter evaluations', () => {
    component.evaluations = mockEvaluations;
    component.searchTerm = 'Genou';
    component.applyFilters();
    expect(component.filteredEvaluations.length).toBe(1);
  });

  it('should create evaluation', () => {
    spyOn(window, 'alert');
    component.newEvaluation = { painScale: 5, painDescription: 'Test', flexionDegrees: 90,
      extensionDegrees: 45, jointLocation: 'Genou', functionalLimitations: 'Test',
      generalObservations: 'Test', treatmentGoals: 'Test', evaluationDate: '2026-03-29',
      patientId: 6, physiotherapistId: 9 };
    mockService.create.and.returnValue(of(mockEvaluations[0]));
    mockService.getByPhysiotherapist.and.returnValue(of(mockEvaluations));
    component.createEvaluation();
    expect(mockService.create).toHaveBeenCalled();
  });

  it('should delete evaluation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    mockService.delete.and.returnValue(of(''));
    mockService.getByPhysiotherapist.and.returnValue(of([]));
    component.deleteEvaluation(1);
    expect(mockService.delete).toHaveBeenCalledWith(1);
  });

  it('should get pain level class', () => {
    expect(component.getPainLevelClass(2)).toBe('pain-low');
    expect(component.getPainLevelClass(5)).toBe('pain-medium');
    expect(component.getPainLevelClass(8)).toBe('pain-high');
  });
});
