import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TreatmentPlanComponent } from './treatment-plan.component';
import { TreatmentPlanService } from '../../services/treatment-plan.service';
import { TreatmentPlan } from '../../models/treatment-plan.model';

describe('TreatmentPlanComponent', () => {
  let component: TreatmentPlanComponent;
  let fixture: ComponentFixture<TreatmentPlanComponent>;
  let mockService: jasmine.SpyObj<TreatmentPlanService>;

  const mockPlans: TreatmentPlan[] = [{
    planId: 1, planName: 'Plan Test', diagnosis: 'Test', therapeuticGoals: 'Test',
    exercises: 'Test', durationWeeks: 4, startDate: '2026-03-01', endDate: '2026-03-29',
    status: 'Active', notes: '', patientId: 6, patientName: 'Patient Test',
    patientEmail: 'test@test.com', physiotherapistId: 9, physiotherapistName: 'Physio',
    createdAt: '2026-03-01', updatedAt: '2026-03-01'
  }];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('TreatmentPlanService', ['getByPhysiotherapist', 'create', 'update', 'updateStatus', 'delete']);
    mockService.getByPhysiotherapist.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [TreatmentPlanComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [{ provide: TreatmentPlanService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentPlanComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load plans', () => {
    mockService.getByPhysiotherapist.and.returnValue(of(mockPlans));
    component.ngOnInit();
    expect(component.plans.length).toBe(1);
  });

  it('should filter plans by status', () => {
    component.plans = mockPlans;
    component.filterStatus = 'Active';
    component.applyFilters();
    expect(component.filteredPlans.length).toBe(1);
  });

  it('should filter plans by search', () => {
    component.plans = mockPlans;
    component.searchTerm = 'Plan Test';
    component.applyFilters();
    expect(component.filteredPlans.length).toBe(1);
  });

  it('should create plan', () => {
    spyOn(window, 'alert');
    component.newPlan = { planName: 'New', diagnosis: 'Test', therapeuticGoals: 'Test',
      exercises: 'Test', durationWeeks: 4, startDate: '2026-03-29', status: 'Active',
      notes: '', patientId: 6, physiotherapistId: 9 };
    mockService.create.and.returnValue(of(mockPlans[0]));
    mockService.getByPhysiotherapist.and.returnValue(of(mockPlans));
    component.createPlan();
    expect(mockService.create).toHaveBeenCalled();
  });

  it('should update plan', () => {
    spyOn(window, 'alert');
    component.selectedPlan = mockPlans[0];
    component.editPlan = { planName: 'Updated', diagnosis: 'Test', therapeuticGoals: 'Test',
      exercises: 'Test', durationWeeks: 4, startDate: '2026-03-29', status: 'Active',
      notes: '', patientId: 6, physiotherapistId: 9 };
    mockService.update.and.returnValue(of(mockPlans[0]));
    mockService.getByPhysiotherapist.and.returnValue(of(mockPlans));
    component.updatePlan();
    expect(mockService.update).toHaveBeenCalled();
  });

  it('should delete plan', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    mockService.delete.and.returnValue(of(''));
    mockService.getByPhysiotherapist.and.returnValue(of([]));
    component.deletePlan(1);
    expect(mockService.delete).toHaveBeenCalledWith(1);
  });

  it('should get status badge class', () => {
    expect(component.getStatusBadgeClass('Active')).toContain('bg-green-100');
    expect(component.getStatusBadgeClass('Completed')).toContain('bg-blue-100');
  });
});
