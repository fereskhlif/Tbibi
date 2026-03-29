import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { HealthGoalsComponent } from './health-goals.component';
import { CommonModule } from '@angular/common';

describe('HealthGoalsComponent', () => {
  let component: HealthGoalsComponent;
  let fixture: ComponentFixture<HealthGoalsComponent>;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8088/api/health-goals';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HealthGoalsComponent],
      imports: [HttpClientTestingModule, FormsModule, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthGoalsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    
    // Mock localStorage
    localStorage.setItem('userId', '123');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ========== INITIALIZATION TESTS ==========
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty goals and showForm=false', () => {
    expect(component.goals).toEqual([]);
    expect(component.showForm).toBeFalse();
    expect(component.selectedGoal).toBeNull();
  });

  it('should load goals on init', () => {
    const mockGoals = [
      { id: 1, goalTitle: 'Lose Weight', goalDescription: 'Lose 5kg', goalType: 'NUMERIC' as const, category: 'Fitness', targetValue: 70, currentProgress: 65, unit: 'kg' },
      { id: 2, goalTitle: 'Read Daily', goalDescription: 'Read every day', goalType: 'HABIT_BASED' as const, category: 'Education', frequencyPerWeek: 7 }
    ];

    fixture.detectChanges();
    const req = httpMock.expectOne(`${baseUrl}/user/123`);
    expect(req.request.method).toBe('GET');
    req.flush(mockGoals);

    expect(component.goals).toEqual(mockGoals);
    expect(component.loading).toBeFalse();
  });

  it('should handle error on load goals', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${baseUrl}/user/123`);
    req.error(new ErrorEvent('Network error'));

    expect(component.goals).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  // ========== FORM TESTS ==========

  it('should initialize newGoal with default values', () => {
    expect(component.newGoal.goalTitle).toBe('');
    expect(component.newGoal.goalType).toBe('NUMERIC');
    expect(component.newGoal.category).toBe('');
    expect(component.newGoal.targetValue).toBeUndefined();
  });

  it('should toggle showForm', () => {
    expect(component.showForm).toBeFalse();
    component.showForm = true;
    expect(component.showForm).toBeTrue();
    component.showForm = false;
    expect(component.showForm).toBeFalse();
  });

  it('should reset form to initial state', () => {
    component.newGoal.goalTitle = 'Test Goal';
    component.newGoal.targetValue = 100;
    
    component.resetForm();
    
    expect(component.newGoal.goalTitle).toBe('');
    expect(component.newGoal.targetValue).toBeUndefined();
    expect(component.newGoal.goalType).toBe('NUMERIC');
  });

  // ========== CREATE GOAL TESTS ==========

  it('should not create goal with empty title', () => {
    component.newGoal.goalTitle = '';
    const httpSpy = spyOn(component['http'], 'post').and.callThrough();
    
    component.createGoal();
    
    expect(httpSpy).not.toHaveBeenCalled();
  });

  it('should create a numeric goal successfully', () => {
    component.newGoal = {
      goalTitle: 'Lose Weight',
      goalDescription: 'Lose 5kg',
      goalType: 'NUMERIC',
      category: 'Fitness',
      targetValue: 70,
      unit: 'kg',
      targetDate: '2026-12-31'
    };

    component.createGoal();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.goalTitle).toBe('Lose Weight');
    expect(req.request.body.goalType).toBe('NUMERIC');

    const createdGoal = { id: 1, ...component.newGoal };
    req.flush(createdGoal);

    expect(component.goals[0]).toEqual(createdGoal);
    expect(component.showForm).toBeFalse();
  });

  it('should create a habit-based goal successfully', () => {
    component.newGoal = {
      goalTitle: 'Exercise',
      goalDescription: 'Exercise more',
      goalType: 'HABIT_BASED',
      category: 'Fitness',
      frequencyPerWeek: 4
    };

    component.createGoal();

    const req = httpMock.expectOne(baseUrl);
    const createdGoal = { id: 2, ...component.newGoal };
    req.flush(createdGoal);

    expect(component.goals.length).toBe(1);
    expect(component.goals[0].frequencyPerWeek).toBe(4);
  });

  it('should handle goal creation error', () => {
    spyOn(window, 'alert');
    component.newGoal.goalTitle = 'Test Goal';

    component.createGoal();

    const req = httpMock.expectOne(baseUrl);
    req.error(new ErrorEvent('Creation failed'));

    expect(window.alert).toHaveBeenCalledWith('Failed to create goal. Please try again.');
  });

  it('should remove targetDate from payload if empty', () => {
    component.newGoal = {
      goalTitle: 'Test',
      goalDescription: 'Test goal',
      goalType: 'NUMERIC',
      category: 'Test',
      targetValue: 50,
      targetDate: ''
    };

    component.createGoal();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.body.targetDate).toBeUndefined();
    req.flush({});
  });

  // ========== DELETE GOAL TESTS ==========

  it('should not delete goal if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const httpSpy = spyOn(component['http'], 'delete').and.callThrough();

    component.deleteGoal(1);

    expect(httpSpy).not.toHaveBeenCalled();
  });

  it('should delete goal when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.goals = [
      { id: 1, goalTitle: 'Goal 1', goalDescription: 'Test', goalType: 'NUMERIC', category: 'Test' },
      { id: 2, goalTitle: 'Goal 2', goalDescription: 'Test', goalType: 'NUMERIC', category: 'Test' }
    ];

    component.deleteGoal(1);

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    expect(component.goals.length).toBe(1);
    expect(component.goals[0].id).toBe(2);
  });

  it('should handle delete error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    component.goals = [{ id: 1, goalTitle: 'Goal 1', goalDescription: 'Test', goalType: 'NUMERIC', category: 'Test' }];

    component.deleteGoal(1);

    const req = httpMock.expectOne(`${baseUrl}/1`);
    req.error(new ErrorEvent('Delete failed'));

    expect(window.alert).toHaveBeenCalledWith('Failed to delete goal.');
    expect(component.goals.length).toBe(1); // Goal still there
  });

  // ========== PROGRESS MODAL TESTS ==========

  it('should open progress modal', () => {
    const goal = { id: 1, goalTitle: 'Test', goalDescription: 'Test', goalType: 'NUMERIC' as const, category: 'Test', currentProgress: 50 };
    
    component.openProgressModal(goal);

    expect(component.selectedGoal).toEqual(goal);
    expect(component.progressValue).toBe(50);
  });

  it('should open progress modal with 0 if no current progress', () => {
    const goal = { id: 1, goalTitle: 'Test', goalDescription: 'Test', goalType: 'NUMERIC' as const, category: 'Test' };
    
    component.openProgressModal(goal);

    expect(component.progressValue).toBe(0);
  });

  it('should close modal by setting selectedGoal to null', () => {
    component.selectedGoal = { id: 1, goalTitle: 'Test', goalDescription: 'Test', goalType: 'NUMERIC', category: 'Test' };
    
    component.selectedGoal = null;

    expect(component.selectedGoal).toBeNull();
  });

  // ========== PROGRESS SUBMISSION TESTS ==========

  it('should not submit progress if no goal selected', () => {
    component.selectedGoal = null;
    const httpSpy = spyOn(component['http'], 'post').and.callThrough();

    component.submitProgress();

    expect(httpSpy).not.toHaveBeenCalled();
  });

  it('should submit progress successfully', () => {
    const goal = { id: 1, goalTitle: 'Lose Weight', goalDescription: 'Test', goalType: 'NUMERIC' as const, category: 'Test', targetValue: 70, currentProgress: 50, unit: 'kg' };
    component.selectedGoal = goal;
    component.goals = [goal];
    component.progressValue = 65;

    component.submitProgress();

    const req = httpMock.expectOne(`${baseUrl}/1/progress`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.value).toBe(65);
    req.flush({});

    expect(component.goals[0].currentProgress).toBe(65);
    expect(component.selectedGoal).toBeNull();
  });

  it('should mark goal as achieved when progress meets target', () => {
    const goal = { id: 1, goalTitle: 'Lose Weight', goalDescription: 'Test', goalType: 'NUMERIC' as const, category: 'Test', targetValue: 70, currentProgress: 50, unit: 'kg', achieved: false };
    component.selectedGoal = goal;
    component.goals = [goal];
    component.progressValue = 70; // Equal to target

    component.submitProgress();

    const req = httpMock.expectOne(`${baseUrl}/1/progress`);
    req.flush({});

    expect(component.goals[0].achieved).toBeTrue();
  });

  it('should handle progress submission error', () => {
    spyOn(window, 'alert');
    component.selectedGoal = { id: 1, goalTitle: 'Test', goalDescription: 'Test', goalType: 'NUMERIC', category: 'Test' };

    component.submitProgress();

    const req = httpMock.expectOne(`${baseUrl}/1/progress`);
    req.error(new ErrorEvent('Update failed'));

    expect(window.alert).toHaveBeenCalledWith('Failed to update progress.');
  });

  // ========== MARK ACHIEVED TESTS ==========

  it('should mark goal as achieved', () => {
    const goal = { id: 1, goalTitle: 'Test', goalDescription: 'Test', goalType: 'BOOLEAN' as const, category: 'Test', achieved: false };

    component.markAchieved(goal);

    expect(goal.achieved).toBeTrue();
  });

  // ========== HELPER METHOD TESTS ==========

  it('should calculate progress percentage correctly', () => {
    const goal1 = { id: 1, goalTitle: '', goalDescription: '', goalType: 'NUMERIC' as const, category: '', currentProgress: 50, targetValue: 100 };
    const goal2 = { id: 2, goalTitle: '', goalDescription: '', goalType: 'NUMERIC' as const, category: '', currentProgress: 100, targetValue: 70 }; // Should cap at 100
    const goal3 = { id: 3, goalTitle: '', goalDescription: '', goalType: 'NUMERIC' as const, category: '' }; // No target/progress

    expect(component.progressPct(goal1)).toBe(50);
    expect(component.progressPct(goal2)).toBe(100);
    expect(component.progressPct(goal3)).toBe(0);
  });

  it('should return correct typeChip classes', () => {
    expect(component.typeChip('NUMERIC')).toBe('bg-blue-100 text-blue-700');
    expect(component.typeChip('BOOLEAN')).toBe('bg-purple-100 text-purple-700');
    expect(component.typeChip('HABIT_BASED')).toBe('bg-orange-100 text-orange-700');
    expect(component.typeChip('UNKNOWN')).toBe('bg-gray-100 text-gray-600');
  });

  // ========== USER ID TESTS ==========

  it('should get userId from localStorage', () => {
    localStorage.setItem('userId', '456');
    const userId = component['userId'];
    expect(userId).toBe(456);
  });

  it('should default to 1 if userId not in localStorage', () => {
    localStorage.removeItem('userId');
    const userId = component['userId'];
    expect(userId).toBe(1);
  });

  // ========== INTEGRATION TESTS ==========

  it('should complete full create and delete cycle', () => {
    // Create
    component.newGoal.goalTitle = 'Test Goal';
    component.newGoal.goalType = 'NUMERIC';
    component.newGoal.targetValue = 100;

    component.createGoal();
    let req = httpMock.expectOne(baseUrl);
    const createdGoal = { id: 1, ...component.newGoal };
    req.flush(createdGoal);

    expect(component.goals.length).toBe(1);

    // Delete
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteGoal(1);
    req = httpMock.expectOne(`${baseUrl}/1`);
    req.flush({});

    expect(component.goals.length).toBe(0);
  });

  it('should complete full progress update cycle', () => {
    // Setup
    const goal = { id: 1, goalTitle: 'Weight', goalDescription: 'Lose weight', goalType: 'NUMERIC' as const, category: 'Health', targetValue: 70, currentProgress: 60, unit: 'kg' };
    component.goals = [goal];

    // Open modal
    component.openProgressModal(goal);
    expect(component.selectedGoal).toBeTruthy();

    // Update progress
    component.progressValue = 68;
    component.submitProgress();
    const req = httpMock.expectOne(`${baseUrl}/1/progress`);
    req.flush({});

    expect(component.goals[0].currentProgress).toBe(68);
  });
});
