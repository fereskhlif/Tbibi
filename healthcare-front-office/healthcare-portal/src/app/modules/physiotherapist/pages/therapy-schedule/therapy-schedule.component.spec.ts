import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TherapyScheduleComponent } from './therapy-schedule.component';
import { TherapySessionService } from '../../services/therapy-session.service';
import { TherapySessionResponse } from '../../models/therapy-session.model';

describe('TherapyScheduleComponent', () => {
  let component: TherapyScheduleComponent;
  let fixture: ComponentFixture<TherapyScheduleComponent>;
  let mockService: jasmine.SpyObj<TherapySessionService>;

  const mockSessions: TherapySessionResponse[] = [{
    sessionId: 1, therapyType: 'Massage', progressNote: 'Good', scheduledDate: '2026-03-30',
    evaluationResult: 'Excellent', startTime: '10:00', endTime: '11:00', durationMinutes: 60,
    status: 'Scheduled', patientId: 6, patientFullName: 'Patient Test',
    physiotherapistId: 9, physiotherapistFullName: 'Physio', exercisesPerformed: undefined,
    sessionNotes: undefined, actualStartTime: undefined, actualEndTime: undefined,
    actualDurationMinutes: undefined
  }];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('TherapySessionService', 
      ['getUpcomingSessions', 'startSession', 'documentSession', 'completeSession', 'cancelSession', 'rescheduleSession']);
    mockService.getUpcomingSessions.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [TherapyScheduleComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [{ provide: TherapySessionService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(TherapyScheduleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sessions', () => {
    mockService.getUpcomingSessions.and.returnValue(of(mockSessions));
    component.ngOnInit();
    expect(component.sessions.length).toBe(1);
  });

  it('should filter by status', () => {
    component.sessions = mockSessions;
    component.filterStatus = 'Scheduled';
    component.applyFilters();
    expect(component.filteredSessions.length).toBe(1);
  });

  it('should start session', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    spyOn(component, 'openDocumentModal');
    mockService.startSession.and.returnValue(of(mockSessions[0]));
    mockService.getUpcomingSessions.and.returnValue(of(mockSessions));
    component.startSession(mockSessions[0]);
    expect(mockService.startSession).toHaveBeenCalledWith(1);
  });

  it('should cancel session', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    mockService.cancelSession.and.returnValue(of(mockSessions[0]));
    mockService.getUpcomingSessions.and.returnValue(of(mockSessions));
    component.cancelSession(mockSessions[0]);
    expect(mockService.cancelSession).toHaveBeenCalledWith(1);
  });

  it('should format duration', () => {
    expect(component.formatDuration(mockSessions[0])).toBe('60 min');
  });

  it('should get status class', () => {
    expect(component.getStatusClass('Scheduled')).toBe('status-scheduled');
    expect(component.getStatusClass('In Progress')).toBe('status-in-progress');
  });

  it('should document session', () => {
    component.selectedSession = mockSessions[0];
    component.documentForm = {
      exercisesPerformed: 'Exercices de flexion',
      sessionNotes: 'Patient coopératif',
      progressNote: '',
      evaluationResult: ''
    };
    spyOn(window, 'alert');
    mockService.documentSession.and.returnValue(of(mockSessions[0]));
    mockService.getUpcomingSessions.and.returnValue(of(mockSessions));
    component.saveDocumentation();
    expect(mockService.documentSession).toHaveBeenCalledWith(1, 'Exercices de flexion', 'Patient coopératif');
  });

  it('should require documentation fields', () => {
    component.selectedSession = mockSessions[0];
    component.documentForm = {
      exercisesPerformed: '',
      sessionNotes: '',
      progressNote: '',
      evaluationResult: ''
    };
    spyOn(window, 'alert');
    component.saveDocumentation();
    expect(window.alert).toHaveBeenCalledWith('Veuillez remplir au moins les exercices ou les notes de séance');
    expect(mockService.documentSession).not.toHaveBeenCalled();
  });

  it('should complete session with documentation', () => {
    const sessionWithDoc = { ...mockSessions[0], exercisesPerformed: 'Test', sessionNotes: 'Test' };
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    mockService.completeSession.and.returnValue(of(sessionWithDoc));
    mockService.getUpcomingSessions.and.returnValue(of(mockSessions));
    component.completeSession(sessionWithDoc);
    expect(mockService.completeSession).toHaveBeenCalled();
  });

  it('should open document modal if no documentation when completing', () => {
    spyOn(component, 'openDocumentModal');
    const sessionWithoutDoc = { ...mockSessions[0], exercisesPerformed: undefined, sessionNotes: undefined };
    component.completeSession(sessionWithoutDoc);
    expect(component.openDocumentModal).toHaveBeenCalledWith(sessionWithoutDoc);
  });

  it('should reschedule session', () => {
    component.selectedSession = mockSessions[0];
    component.rescheduleForm = { newDate: '2026-04-01', newStartTime: '15:00', newEndTime: '16:00' };
    spyOn(window, 'alert');
    mockService.rescheduleSession.and.returnValue(of(mockSessions[0]));
    mockService.getUpcomingSessions.and.returnValue(of(mockSessions));
    component.rescheduleSession();
    expect(mockService.rescheduleSession).toHaveBeenCalledWith(1, '2026-04-01', '15:00', '16:00');
  });

  it('should require all reschedule fields', () => {
    component.selectedSession = mockSessions[0];
    component.rescheduleForm = { newDate: '', newStartTime: '15:00', newEndTime: '16:00' };
    spyOn(window, 'alert');
    component.rescheduleSession();
    expect(window.alert).toHaveBeenCalledWith('Veuillez remplir tous les champs');
    expect(mockService.rescheduleSession).not.toHaveBeenCalled();
  });

  it('should open and close modals', () => {
    component.openDocumentModal(mockSessions[0]);
    expect(component.showDocumentModal).toBe(true);
    component.closeDocumentModal();
    expect(component.showDocumentModal).toBe(false);

    component.openRescheduleModal(mockSessions[0]);
    expect(component.showRescheduleModal).toBe(true);
    component.closeRescheduleModal();
    expect(component.showRescheduleModal).toBe(false);
  });

  it('should get status badge class', () => {
    expect(component.getStatusBadgeClass('Scheduled')).toContain('bg-blue-100');
    expect(component.getStatusBadgeClass('In Progress')).toContain('bg-green-100');
    expect(component.getStatusBadgeClass('Completed')).toContain('bg-gray-100');
  });

  it('should complete session from modal', () => {
    component.selectedSession = mockSessions[0];
    component.documentForm = {
      exercisesPerformed: 'Test',
      sessionNotes: 'Test',
      progressNote: 'Good',
      evaluationResult: 'Excellent'
    };
    spyOn(window, 'alert');
    mockService.completeSession.and.returnValue(of(mockSessions[0]));
    mockService.getUpcomingSessions.and.returnValue(of(mockSessions));
    component.completeSessionFromModal();
    expect(mockService.completeSession).toHaveBeenCalled();
  });
});
