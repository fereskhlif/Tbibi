import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrescriptionsComponent } from './prescriptions.component';
import { PrescriptionService, PrescriptionResponse, ActeDTO } from '../../../../services/prescription-service.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('PrescriptionsComponent (Patient)', () => {
  let component: PrescriptionsComponent;
  let fixture: ComponentFixture<PrescriptionsComponent>;
  let mockPrescriptionService: jasmine.SpyObj<PrescriptionService>;

  const mockPrescriptions: PrescriptionResponse[] = [
    {
      prescriptionID: 1,
      doctorId: 101,
      doctorName: 'Dr. House',
      status: 'PENDING',
      date: '2026-03-10T10:00:00Z',
      medicines: [],
      note: 'Note 1',
      statusUpdatedAt: ''
    },
    {
      prescriptionID: 2,
      doctorId: 102,
      doctorName: 'Dr. Strange',
      status: 'VALIDATED',
      date: '2026-03-15T14:30:00Z',
      medicines: [],
      note: 'Note 2',
      statusUpdatedAt: ''
    }
  ];

  const mockActes: ActeDTO[] = [
    {
      acteId: 10,
      doctorId: 101,
      doctorName: 'Dr. House',
      description: 'Consultation générale',
      date: '2026-03-10T09:30:00Z'
    },
    {
      acteId: 11,
      doctorId: 103, // A doctor only present in actes
      doctorName: 'Dr. Who',
      description: 'Examen de routine',
      date: '2026-03-12T11:00:00Z'
    }
  ];

  beforeEach(async () => {
    mockPrescriptionService = jasmine.createSpyObj('PrescriptionService', ['getMyPrescriptions', 'getMyActes']);
    
    // Default mock behavior
    mockPrescriptionService.getMyPrescriptions.and.returnValue(of(mockPrescriptions));
    mockPrescriptionService.getMyActes.and.returnValue(of(mockActes));

    await TestBed.configureTestingModule({
      declarations: [PrescriptionsComponent],
      imports: [FormsModule],
      providers: [
        { provide: PrescriptionService, useValue: mockPrescriptionService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionsComponent);
    component = fixture.componentInstance;
    
    // Disable interval polling in tests to avoid async tick issues
    spyOn(component as any, 'ngOnInit').and.callFake(() => {
      component.loadAll(); // Only call loadAll, Skip the interval()
    });
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Data Loading', () => {
    it('should load prescriptions and actes on initialization', () => {
      expect(mockPrescriptionService.getMyPrescriptions).toHaveBeenCalled();
      expect(mockPrescriptionService.getMyActes).toHaveBeenCalled();
      
      expect(component.prescriptions.length).toBe(2);
      expect(component.actes.length).toBe(2);
      expect(component.loading).toBeFalse();
      expect(component.loadingActes).toBeFalse();
    });

    it('should handle errors when loading prescriptions', () => {
      mockPrescriptionService.getMyPrescriptions.and.returnValue(throwError(() => new Error('API Error')));
      component.loadAll();
      
      expect(component.error).toBe('Erreur lors du chargement des données.');
      expect(component.loading).toBeFalse();
    });
  });

  describe('Computed Properties', () => {
    it('should combine and sort unique doctors from both prescriptions and actes', () => {
      // Should find: Dr. House (101), Dr. Strange (102), Dr. Who (103)
      const expectedDoctors = [
        { doctorId: 101, doctorName: 'Dr. House' },
        { doctorId: 102, doctorName: 'Dr. Strange' },
        { doctorId: 103, doctorName: 'Dr. Who' }
      ];

      const doctorsList = component.doctors;
      
      expect(doctorsList.length).toBe(3);
      // Alphabetical sorting check
      expect(doctorsList[0].doctorName).toBe('Dr. House');
      expect(doctorsList[1].doctorName).toBe('Dr. Strange');
      expect(doctorsList[2].doctorName).toBe('Dr. Who');
    });

    describe('filtered getter (Prescriptions)', () => {
      it('should return all prescriptions when filter is ALL and no doctor selected', () => {
        component.activeFilter = 'ALL';
        component.selectedDoctorId = null;
        
        expect(component.filtered.length).toBe(2);
      });

      it('should filter prescriptions by status', () => {
        component.activeFilter = 'PENDING';
        component.selectedDoctorId = null;
        
        const filtered = component.filtered;
        expect(filtered.length).toBe(1);
        expect(filtered[0].status).toBe('PENDING');
      });

      it('should filter prescriptions by selected doctor', () => {
        component.activeFilter = 'ALL';
        component.selectedDoctorId = 101; // Dr. House
        
        const filtered = component.filtered;
        expect(filtered.length).toBe(1);
        expect(filtered[0].doctorName).toBe('Dr. House');
      });

      it('should filter prescriptions by both status and doctor', () => {
        component.activeFilter = 'VALIDATED';
        component.selectedDoctorId = 101; // Dr. House
        
        // Dr. House only has a PENDING prescription, so this should return 0
        expect(component.filtered.length).toBe(0);
      });
    });

    describe('filteredActes getter (Actes)', () => {
      it('should return all actes when no doctor selected', () => {
        component.selectedDoctorId = null;
        expect(component.filteredActes.length).toBe(2);
      });

      it('should filter actes by selected doctor', () => {
        component.selectedDoctorId = 101; // Dr. House
        
        const filteredActes = component.filteredActes;
        expect(filteredActes.length).toBe(1);
        expect(filteredActes[0].doctorId).toBe(101);
        expect(filteredActes[0].doctorName).toBe('Dr. House');
      });

      it('should sort actes by date descending', () => {
        component.selectedDoctorId = null;
        component.sortDesc = true;
        
        const filteredActes = component.filteredActes;
        // Dr. Who's acte (March 12) is newer than Dr. House's (March 10)
        expect(filteredActes[0].acteId).toBe(11); // March 12
        expect(filteredActes[1].acteId).toBe(10); // March 10
      });
      
      it('should sort actes by date ascending', () => {
        component.selectedDoctorId = null;
        component.sortDesc = false; // Ascending
        
        const filteredActes = component.filteredActes;
        expect(filteredActes[0].acteId).toBe(10); // March 10
        expect(filteredActes[1].acteId).toBe(11); // March 12
      });
    });
  });
});
