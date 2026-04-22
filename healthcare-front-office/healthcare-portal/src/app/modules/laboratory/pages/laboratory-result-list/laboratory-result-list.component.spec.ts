import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { LaboratoryResultListComponent } from './laboratory-result-list.component';
import { LaboratoryResultService } from '../../services/laboratory-result.service';
import { AuthService } from '../../../patient/services/auth.service';
import { LaboratoryResultResponse } from '../../models/laboratory-result.model';

describe('LaboratoryResultListComponent', () => {
  let component: LaboratoryResultListComponent;
  let fixture: ComponentFixture<LaboratoryResultListComponent>;
  let mockLaboratoryService: jasmine.SpyObj<LaboratoryResultService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockResults: LaboratoryResultResponse[] = [
    {
      labId: 1,
      testName: 'Blood Test',
      location: 'Main Lab',
      nameLabo: 'City Lab',
      resultValue: 'Normal',
      status: 'Completed',
      testDate: '2026-03-28',
      laboratoryUserId: 1,
      laboratoryUserName: 'Lab Tech',
      patientId: 2,
      patientName: 'John Doe',
      prescribedByDoctorId: 3,
      prescribedByDoctorName: 'Dr. Smith',
      priority: 'Normal',
      requestedAt: '2026-03-27T10:00:00',
      requestNotes: 'Routine checkup',
      notificationMessage: undefined,
      notificationSent: false,
      notificationDate: undefined
    },
    {
      labId: 2,
      testName: 'Glucose Test',
      location: 'Main Lab',
      nameLabo: 'City Lab',
      resultValue: 'High',
      status: 'Pending',
      testDate: '2026-03-28',
      laboratoryUserId: 1,
      laboratoryUserName: 'Lab Tech',
      patientId: 2,
      patientName: 'John Doe',
      prescribedByDoctorId: 3,
      prescribedByDoctorName: 'Dr. Smith',
      priority: 'Urgent',
      requestedAt: '2026-03-28T09:00:00',
      requestNotes: 'Follow-up test',
      notificationMessage: undefined,
      notificationSent: false,
      notificationDate: undefined
    }
  ];

  beforeEach(async () => {
    mockLaboratoryService = jasmine.createSpyObj('LaboratoryResultService', [
      'getAll',
      'create',
      'update',
      'delete',
      'updateStatus'
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);

    // Set default return values to prevent undefined errors
    mockLaboratoryService.getAll.and.returnValue(of([]));
    mockAuthService.getCurrentUserId.and.returnValue(1);

    await TestBed.configureTestingModule({
      declarations: [LaboratoryResultListComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        { provide: LaboratoryResultService, useValue: mockLaboratoryService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryResultListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load all results on init', () => {
      mockLaboratoryService.getAll.and.returnValue(of(mockResults));
      
      component.ngOnInit();
      
      expect(mockLaboratoryService.getAll).toHaveBeenCalled();
      expect(component.results.length).toBe(2);
      expect(component.isLoading).toBe(false);
    });

    it('should handle error when loading results', () => {
      mockLaboratoryService.getAll.and.returnValue(throwError(() => new Error('Network error')));
      
      component.ngOnInit();
      
      expect(component.errorMessage).toBe('Failed to load results.');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('filterByStatus', () => {
    it('should filter results by status', () => {
      component.results = mockResults;
      
      component.filterByStatus('Completed');
      
      expect(component.activeStatus).toBe('Completed');
      const filtered = component.filteredResults;
      expect(filtered.length).toBe(1);
      expect(filtered[0].status).toBe('Completed');
    });

    it('should show all results when status is "All"', () => {
      component.results = mockResults;
      
      component.filterByStatus('All');
      
      expect(component.filteredResults.length).toBe(2);
    });
  });

  describe('filterByPriority', () => {
    it('should filter results by priority', () => {
      component.results = mockResults;
      
      component.filterByPriority('Urgent');
      
      expect(component.activePriority).toBe('Urgent');
      const filtered = component.filteredResults;
      expect(filtered.length).toBe(1);
      expect(filtered[0].priority).toBe('Urgent');
    });
  });

  describe('toggleUrgentOnly', () => {
    it('should toggle urgent only filter', () => {
      component.showUrgentOnly = false;
      
      component.toggleUrgentOnly();
      
      expect(component.showUrgentOnly).toBe(true);
    });

    it('should filter only urgent and critical results when enabled', () => {
      component.results = mockResults;
      component.showUrgentOnly = true;
      
      const filtered = component.filteredResults;
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].priority).toBe('Urgent');
    });
  });

  describe('filteredResults', () => {
    it('should sort results by priority (Critical > Urgent > Normal)', () => {
      const unsortedResults: LaboratoryResultResponse[] = [
        { ...mockResults[0], priority: 'Normal' },
        { ...mockResults[1], priority: 'Critical' },
        { ...mockResults[0], labId: 3, priority: 'Urgent' }
      ];
      component.results = unsortedResults;
      
      const filtered = component.filteredResults;
      
      expect(filtered[0].priority).toBe('Critical');
      expect(filtered[1].priority).toBe('Urgent');
      expect(filtered[2].priority).toBe('Normal');
    });

    it('should filter by search term', () => {
      component.results = mockResults;
      component.searchTerm = 'Blood';
      
      const filtered = component.filteredResults;
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].testName).toBe('Blood Test');
    });
  });

  describe('openCreateForm', () => {
    it('should open form in create mode', () => {
      mockAuthService.getCurrentUserId.and.returnValue(1);
      
      component.openCreateForm();
      
      expect(component.showForm).toBe(true);
      expect(component.isEditMode).toBe(false);
      expect(component.formData.laboratoryUserId).toBe(1);
    });
  });

  describe('openEditForm', () => {
    it('should open form in edit mode with result data', () => {
      const result = mockResults[0];
      
      component.openEditForm(result);
      
      expect(component.showForm).toBe(true);
      expect(component.isEditMode).toBe(true);
      expect(component.editingId).toBe(result.labId);
      expect(component.formData.testName).toBe(result.testName);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUserId.and.returnValue(1);
      component.formData = {
        testName: 'New Test',
        location: 'Lab A',
        nameLabo: 'City Lab',
        resultValue: 'Normal',
        status: 'Pending',
        testDate: '2026-03-28',
        laboratoryUserId: 1,
        patientId: 2,
        prescribedByDoctorId: 3,
        priority: 'Normal',
        requestNotes: 'Test notes'
      };
    });

    it('should create new result when not in edit mode', () => {
      mockLaboratoryService.create.and.returnValue(of(mockResults[0]));
      component.isEditMode = false;
      
      component.onSubmit();
      
      expect(mockLaboratoryService.create).toHaveBeenCalled();
      expect(component.successMessage).toContain('created');
    });

    it('should update result when in edit mode', () => {
      mockLaboratoryService.update.and.returnValue(of(mockResults[0]));
      component.isEditMode = true;
      component.editingId = 1;
      
      component.onSubmit();
      
      expect(mockLaboratoryService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(component.successMessage).toContain('updated');
    });

    it('should show error when required fields are missing', () => {
      component.formData.testName = '';
      
      component.onSubmit();
      
      expect(component.errorMessage).toContain('required fields');
    });
  });

  describe('onSaveAsDraft', () => {
    it('should save as draft with minimal fields', () => {
      mockAuthService.getCurrentUserId.and.returnValue(1);
      mockLaboratoryService.create.and.returnValue(of(mockResults[0]));
      component.formData = {
        testName: 'Draft Test',
        location: '',
        nameLabo: 'City Lab',
        resultValue: '',
        status: '',
        testDate: '',
        laboratoryUserId: 1,
        patientId: null,
        prescribedByDoctorId: null,
        priority: 'Normal',
        requestNotes: ''
      };
      
      component.onSaveAsDraft();
      
      expect(mockLaboratoryService.create).toHaveBeenCalled();
      expect(component.successMessage).toContain('Draft saved');
    });

    it('should require testName and nameLabo for draft', () => {
      component.formData.testName = '';
      component.formData.nameLabo = '';
      
      component.onSaveAsDraft();
      
      expect(component.errorMessage).toContain('required to save as draft');
    });
  });

  describe('onDelete', () => {
    it('should delete result after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockLaboratoryService.delete.and.returnValue(of(''));
      
      component.onDelete(1);
      
      expect(mockLaboratoryService.delete).toHaveBeenCalledWith(1);
      expect(component.successMessage).toContain('deleted');
    });

    it('should not delete if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.onDelete(1);
      
      expect(mockLaboratoryService.delete).not.toHaveBeenCalled();
    });
  });

  describe('onQuickStatusUpdate', () => {
    it('should update status after confirmation', () => {
      const testResult = mockResults[1]; // labId: 2
      spyOn(window, 'confirm').and.returnValue(true);
      mockLaboratoryService.updateStatus.and.returnValue(of(testResult));
      
      component.onQuickStatusUpdate(testResult, 'Completed');
      
      expect(mockLaboratoryService.updateStatus).toHaveBeenCalledWith(testResult.labId, 'Completed');
      expect(component.successMessage).toContain('Status updated');
    });
  });

  describe('getNextStatus', () => {
    it('should return next status in workflow', () => {
      expect(component.getNextStatus('Draft')).toBe('Pending');
      expect(component.getNextStatus('Pending')).toBe('In Progress');
      expect(component.getNextStatus('In Progress')).toBe('Completed');
      expect(component.getNextStatus('Completed')).toBe('Validated');
      expect(component.getNextStatus('Validated')).toBeNull();
    });
  });

  describe('canAdvanceStatus', () => {
    it('should return true if status can be advanced', () => {
      expect(component.canAdvanceStatus('Pending')).toBe(true);
      expect(component.canAdvanceStatus('Validated')).toBe(false);
    });
  });

  describe('getStatusClass', () => {
    it('should return correct CSS class for status', () => {
      expect(component.getStatusClass('Draft')).toBe('chip-gray');
      expect(component.getStatusClass('Pending')).toBe('chip-yellow');
      expect(component.getStatusClass('Completed')).toBe('chip-green');
    });
  });

  describe('getPriorityClass', () => {
    it('should return correct CSS class for priority', () => {
      expect(component.getPriorityClass('Critical')).toBe('priority-critical');
      expect(component.getPriorityClass('Urgent')).toBe('priority-urgent');
      expect(component.getPriorityClass('Normal')).toBe('priority-normal');
    });
  });

  describe('getPriorityIcon', () => {
    it('should return correct icon for priority', () => {
      expect(component.getPriorityIcon('Critical')).toBe('🔴');
      expect(component.getPriorityIcon('Urgent')).toBe('🟠');
      expect(component.getPriorityIcon('Normal')).toBe('🟢');
    });
  });
});
