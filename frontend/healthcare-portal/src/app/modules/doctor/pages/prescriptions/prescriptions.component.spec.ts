import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { DoctorPrescriptionsComponent } from './prescriptions.component';
import { PrescriptionService } from '../../../../services/prescription-service.service';

describe('DoctorPrescriptionsComponent', () => {
  let component: DoctorPrescriptionsComponent;
  let fixture: ComponentFixture<DoctorPrescriptionsComponent>;
  let prescriptionServiceSpy: jasmine.SpyObj<PrescriptionService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PrescriptionService', [
      'getAll',
      'getAllActes',
      'getAllPatients',
      'add',
      'update',
      'delete',
      'updateStatus',
      'assignActe',
      'addActeForPatient'
    ]);

    await TestBed.configureTestingModule({
      declarations: [DoctorPrescriptionsComponent],
      imports: [FormsModule],
      providers: [
        { provide: PrescriptionService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorPrescriptionsComponent);
    component = fixture.componentInstance;
    prescriptionServiceSpy = TestBed.inject(PrescriptionService) as jasmine.SpyObj<PrescriptionService>;

    // Mock global pour tous les tests
    prescriptionServiceSpy.getAll.and.returnValue(of([]));
    prescriptionServiceSpy.getAllActes.and.returnValue(of([]));
    prescriptionServiceSpy.getAllPatients.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showModal).toBeFalse();
    expect(component.editMode).toBeFalse();
    expect(component.saving).toBeFalse();
    expect(component.activeFilter).toBe('ALL');
    expect(component.sortDesc).toBeTrue();
  });

  // ─────────────────────────────────────────────────────────────
  describe('openAddModal', () => {
    it('should set form with current date', () => {
      const beforeDate = new Date();
      component.openAddModal();
      const afterDate = new Date();

      expect(component.editMode).toBeFalse();
      expect(component.selectedId).toBeNull();
      expect(component.showModal).toBeTrue();
      expect(component.form.patientId).toBeNull();
      expect(component.form.acteDescription).toBe('');
      expect(component.form.typeOfActe).toBe('PRESCRIPTION');
      expect(component.form.note).toBe('');

      const formDate = new Date(component.form.date);
      expect(formDate.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime() - 1000);
      expect(formDate.getTime()).toBeLessThanOrEqual(afterDate.getTime() + 1000);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('filtered', () => {
    it('should return all prescriptions when filter is ALL', () => {
      component.prescriptions = [
        { prescriptionID: 1, status: 'PENDING' } as any,
        { prescriptionID: 2, status: 'VALIDATED' } as any,
        { prescriptionID: 3, status: 'COMPLETED' } as any
      ];
      component.activeFilter = 'ALL';
      expect(component.filtered.length).toBe(3);
    });

    it('should filter prescriptions by status', () => {
      component.prescriptions = [
        { prescriptionID: 1, status: 'PENDING' } as any,
        { prescriptionID: 2, status: 'VALIDATED' } as any,
        { prescriptionID: 3, status: 'COMPLETED' } as any
      ];
      component.activeFilter = 'PENDING';
      expect(component.filtered.length).toBe(1);
      expect(component.filtered[0].prescriptionID).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('countByStatus', () => {
    it('should count prescriptions by status', () => {
      component.prescriptions = [
        { status: 'PENDING' } as any,
        { status: 'PENDING' } as any,
        { status: 'VALIDATED' } as any
      ];
      expect(component.countByStatus('PENDING')).toBe(2);
      expect(component.countByStatus('VALIDATED')).toBe(1);
      expect(component.countByStatus('COMPLETED')).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('stepOf', () => {
    it('should return correct step for each status', () => {
      expect(component.stepOf('PENDING')).toBe(0);
      expect(component.stepOf('VALIDATED')).toBe(1);
      expect(component.stepOf('DISPENSED')).toBe(2);
      expect(component.stepOf('COMPLETED')).toBe(3);
      expect(component.stepOf('CANCELLED')).toBe(-1);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('trackById', () => {
    it('should return prescriptionID', () => {
      const prescription = { prescriptionID: 123 } as any;
      expect(component.trackById(0, prescription)).toBe(123);
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('save', () => {
    beforeEach(() => {
      // Reset des mocks pour loadAll()
      prescriptionServiceSpy.getAll.and.returnValue(of([]));
      prescriptionServiceSpy.getAllActes.and.returnValue(of([]));
      prescriptionServiceSpy.getAllPatients.and.returnValue(of([]));

      component.form = {
        patientId: 1,
        acteDescription: 'Test acte description',
        typeOfActe: 'PRESCRIPTION',
        note: 'Test note',
        date: '2026-03-17T10:00'
      };
    });

    it('should not save if already saving', () => {
      component.saving = true;
      component.save();
      expect(prescriptionServiceSpy.addActeForPatient).not.toHaveBeenCalled();
      expect(prescriptionServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should show error if no patient selected in add mode', () => {
      component.editMode = false;
      component.form.patientId = null;
      component.save();
      expect(component.error).toBe('Veuillez sélectionner un patient.');
      expect(prescriptionServiceSpy.addActeForPatient).not.toHaveBeenCalled();
    });

    it('should show error if no acte description in add mode', () => {
      component.editMode = false;
      component.form.patientId = 1;
      component.form.acteDescription = '';
      component.save();
      expect(component.error).toBe('Veuillez fournir une description pour l\'acte.');
      expect(prescriptionServiceSpy.addActeForPatient).not.toHaveBeenCalled();
    });

    it('should append :00.000Z to date if length is 16', fakeAsync(() => {
      prescriptionServiceSpy.addActeForPatient.and.returnValue(of({ acteId: 1 }));
      prescriptionServiceSpy.add.and.returnValue(of({ prescriptionID: 1 } as any));
      prescriptionServiceSpy.assignActe.and.returnValue(of({} as any));

      component.editMode = false;
      component.form.date = '2026-03-17T10:00'; // exactement 16 caractères

      component.save();
      tick();

      expect(prescriptionServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ date: '2026-03-17T10:00:00.000Z' })
      );
    }));

    // ── Mode Ajout ──────────────────────────────────────────────
    it('should call addActeForPatient → add → assignActe in add mode', fakeAsync(() => {
      prescriptionServiceSpy.addActeForPatient.and.returnValue(of({ acteId: 10 }));
      prescriptionServiceSpy.add.and.returnValue(of({ prescriptionID: 99 } as any));
      prescriptionServiceSpy.assignActe.and.returnValue(of({} as any));

      component.editMode = false;
      component.form = {
        patientId: 1,
        acteDescription: 'Consultation',
        typeOfActe: 'PRESCRIPTION',
        note: 'Test note',
        date: '2026-03-17T10:00'
      };

      component.save();
      tick();

      expect(prescriptionServiceSpy.addActeForPatient).toHaveBeenCalledWith(1, {
        date: '2026-03-17T10:00:00.000Z',
        description: 'Consultation',
        typeOfActe: 'PRESCRIPTION'
      });
      expect(prescriptionServiceSpy.add).toHaveBeenCalledWith({
        note: 'Test note',
        date: '2026-03-17T10:00:00.000Z'
      });
      expect(prescriptionServiceSpy.assignActe).toHaveBeenCalledWith(99, 10);
    }));

    it('should close modal and reset saving after successful add', fakeAsync(() => {
      prescriptionServiceSpy.addActeForPatient.and.returnValue(of({ acteId: 10 }));
      prescriptionServiceSpy.add.and.returnValue(of({ prescriptionID: 99 } as any));
      prescriptionServiceSpy.assignActe.and.returnValue(of({} as any));

      component.editMode = false;
      component.save();
      tick();

      expect(component.showModal).toBeFalse();
      expect(component.saving).toBeFalse();
    }));

    it('should handle creation error', fakeAsync(() => {
      prescriptionServiceSpy.addActeForPatient.and.returnValue(
        throwError(() => new Error('Erreur réseau'))
      );

      component.editMode = false;
      component.save();
      tick();

      expect(component.error).toBe('Erreur lors de la création de l\'acte et de la prescription.');
      expect(component.saving).toBeFalse();
    }));

    // ── Mode Modification ───────────────────────────────────────
    it('should call update() with correct data in edit mode', fakeAsync(() => {
      prescriptionServiceSpy.update.and.returnValue(of({} as any));

      component.editMode = true;
      component.selectedId = 42;
      component.form = {
        patientId: null,
        acteDescription: '',
        typeOfActe: 'PRESCRIPTION',
        note: 'Note modifiée',
        date: '2026-03-17T10:00'
      };

      component.save();
      tick();

      expect(prescriptionServiceSpy.update).toHaveBeenCalledWith(42, {
        note: 'Note modifiée',
        date: '2026-03-17T10:00:00.000Z'
      });
      expect(prescriptionServiceSpy.addActeForPatient).not.toHaveBeenCalled();
    }));

    it('should close modal after successful update', fakeAsync(() => {
      prescriptionServiceSpy.update.and.returnValue(of({} as any));

      component.editMode = true;
      component.selectedId = 42;
      component.save();
      tick();

      expect(component.showModal).toBeFalse();
      expect(component.saving).toBeFalse();
    }));

    it('should set error on update failure', fakeAsync(() => {
      prescriptionServiceSpy.update.and.returnValue(
        throwError(() => new Error('Erreur serveur'))
      );

      component.editMode = true;
      component.selectedId = 42;
      component.save();
      tick();

      expect(component.error).toBe('Erreur modification');
      expect(component.saving).toBeFalse();
    }));
  });

  // ─────────────────────────────────────────────────────────────
  describe('deletePrescription', () => {
    beforeEach(() => {
      // Reset des mocks pour loadAll()
      prescriptionServiceSpy.getAll.and.returnValue(of([]));
      prescriptionServiceSpy.getAllActes.and.returnValue(of([]));
      prescriptionServiceSpy.getAllPatients.and.returnValue(of([]));

      spyOn(window, 'confirm').and.returnValue(true);
      component.prescriptions = [
        { prescriptionID: 1, status: 'PENDING' } as any,
        { prescriptionID: 2, status: 'VALIDATED' } as any
      ];
    });

    it('should delete prescription successfully', fakeAsync(() => {
      prescriptionServiceSpy.delete.and.returnValue(of(void 0));

      component.deletePrescription(1);
      tick();

      expect(prescriptionServiceSpy.delete).toHaveBeenCalledWith(1);
      expect(component.prescriptions.length).toBe(1);
      expect(component.prescriptions[0].prescriptionID).toBe(2);
    }));

    it('should handle delete error', fakeAsync(() => {
      prescriptionServiceSpy.delete.and.returnValue(
        throwError(() => new Error('Delete error'))
      );

      component.deletePrescription(1);
      tick();

      expect(component.error).toBe('Erreur lors de la suppression.');
      expect(component.prescriptions.length).toBe(2);
    }));

    it('should not delete if user cancels confirmation', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);

      component.deletePrescription(1);

      expect(prescriptionServiceSpy.delete).not.toHaveBeenCalled();
      expect(component.prescriptions.length).toBe(2);
    });

    it('should close detail modal if deleted prescription was being viewed', fakeAsync(() => {
      component.detailRx = { prescriptionID: 1 } as any;
      component.showDetail = true;
      prescriptionServiceSpy.delete.and.returnValue(of(void 0));

      component.deletePrescription(1);
      tick();

      expect(component.showDetail).toBeFalse();
      expect(component.detailRx).toBeNull();
    }));
  });

  // ─────────────────────────────────────────────────────────────
  describe('saveAssign', () => {
    beforeEach(() => {
      // Reset des mocks pour loadAll()
      prescriptionServiceSpy.getAll.and.returnValue(of([]));
      prescriptionServiceSpy.getAllActes.and.returnValue(of([]));
      prescriptionServiceSpy.getAllPatients.and.returnValue(of([]));

      component.assigningRx = { prescriptionID: 1 } as any;
      component.selectedActeId = 2;
      component.showAssignModal = true;
    });

    it('should assign acte successfully', fakeAsync(() => {
      prescriptionServiceSpy.assignActe.and.returnValue(of({} as any));

      component.saveAssign();
      tick();

      expect(prescriptionServiceSpy.assignActe).toHaveBeenCalledWith(1, 2);
      expect(component.showAssignModal).toBeFalse();
    }));

    it('should handle assign error', fakeAsync(() => {
      prescriptionServiceSpy.assignActe.and.returnValue(
        throwError(() => new Error('Assign error'))
      );

      component.saveAssign();
      tick();

      expect(component.error).toBe('Erreur lors de l\'affectation.');
    }));

    it('should not assign if no assigningRx', () => {
      component.assigningRx = null;
      component.saveAssign();
      expect(prescriptionServiceSpy.assignActe).not.toHaveBeenCalled();
    });

    it('should not assign if no selectedActeId', () => {
      component.selectedActeId = null;
      component.saveAssign();
      expect(prescriptionServiceSpy.assignActe).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  describe('openAssignModal', () => {
    it('should open assign modal with correct data', () => {
      const prescription = { prescriptionID: 1, acteId: 5 } as any;
      const event = new Event('click');

      component.openAssignModal(prescription, event);

      expect(component.assigningRx).toBe(prescription);
      expect(component.selectedActeId).toBe(5);
      expect(component.showAssignModal).toBeTrue();
    });

    it('should set selectedActeId to null if prescription has no acteId', () => {
      const prescription = { prescriptionID: 1 } as any;

      component.openAssignModal(prescription);

      expect(component.selectedActeId).toBeNull();
    });
  });
});