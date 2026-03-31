import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientMedicineService } from './patient-medicine.service';
import { Medicine } from '../models/medicine.model';
import { Pharmacy } from '../models/pharmacy.model';

describe('PatientMedicineService', () => {
    let service: PatientMedicineService;
    let httpMock: HttpTestingController;

    const apiUrl = 'http://localhost:8088/api/medicines';
    const pharmacyUrl = 'http://localhost:8088/api/pharmacies';

    const mockMedicines: Medicine[] = [
        {
            medicineId: 1, medicineName: 'Aspirin', description: 'Pain reliever',
            dosage: '500mg', price: 5.99, stock: 100, minStockAlert: 10,
            available: true, pharmacyId: 1, imageUrls: ['']
        },
        {
            medicineId: 2, medicineName: 'Ibuprofen', description: 'Anti-inflammatory',
            dosage: '400mg', price: 8.50, stock: 50, minStockAlert: 5,
            available: true, pharmacyId: 1, imageUrls: []
        }
    ];

    const mockPharmacies: Pharmacy[] = [
        { pharmacyId: 1, pharmacyName: 'Central Pharmacy', pharmacyAddress: '123 Main St' },
        { pharmacyId: 2, pharmacyName: 'Health Plus', pharmacyAddress: '456 Oak Ave' }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PatientMedicineService]
        });
        service = TestBed.inject(PatientMedicineService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // ── MEDICINES ──────────────────────────────────────────────
    describe('Medicines', () => {

        it('should fetch all medicines', () => {
            service.getAll().subscribe(meds => {
                expect(meds.length).toBe(2);
                expect(meds[0].medicineName).toBe('Aspirin');
            });
            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('GET');
            req.flush(mockMedicines);
        });

        it('should fetch medicines by pharmacy', () => {
            service.getByPharmacy(1).subscribe(meds => {
                expect(meds.length).toBe(2);
            });
            const req = httpMock.expectOne(`${apiUrl}/pharmacy/1`);
            expect(req.request.method).toBe('GET');
            req.flush(mockMedicines);
        });

        it('should fetch medicine by ID', () => {
            service.getById(1).subscribe(med => {
                expect(med.medicineId).toBe(1);
                expect(med.medicineName).toBe('Aspirin');
            });
            const req = httpMock.expectOne(`${apiUrl}/1`);
            expect(req.request.method).toBe('GET');
            req.flush(mockMedicines[0]);
        });

        it('should search medicines by name', () => {
            service.searchByName('Asp').subscribe(meds => {
                expect(meds.length).toBe(1);
            });
            const req = httpMock.expectOne(`${apiUrl}/search?name=Asp`);
            expect(req.request.method).toBe('GET');
            req.flush([mockMedicines[0]]);
        });

        it('should handle error when fetching medicines', () => {
            service.getAll().subscribe({
                next: () => fail('Should have failed'),
                error: (err) => expect(err.status).toBe(500)
            });
            const req = httpMock.expectOne(apiUrl);
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });

        it('should handle 404 when medicine not found', () => {
            service.getById(999).subscribe({
                next: () => fail('Should have failed'),
                error: (err) => expect(err.status).toBe(404)
            });
            const req = httpMock.expectOne(`${apiUrl}/999`);
            req.flush('Not Found', { status: 404, statusText: 'Not Found' });
        });
    });

    // ── PHARMACIES ─────────────────────────────────────────────
    describe('Pharmacies', () => {

        it('should fetch all pharmacies', () => {
            service.getPharmacies().subscribe(pharms => {
                expect(pharms.length).toBe(2);
                expect(pharms[0].pharmacyName).toBe('Central Pharmacy');
            });
            const req = httpMock.expectOne(pharmacyUrl);
            expect(req.request.method).toBe('GET');
            req.flush(mockPharmacies);
        });

        it('should handle error when fetching pharmacies', () => {
            service.getPharmacies().subscribe({
                next: () => fail('Should have failed'),
                error: (err) => expect(err.status).toBe(500)
            });
            const req = httpMock.expectOne(pharmacyUrl);
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });
    });
});