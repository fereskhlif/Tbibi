import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';

import {
  PatientRecordsComponent,
  PatientRecordDTO,
  PrescriptionMinimalDTO,
  VaccineRequest,
  UrinaryExamRequest,
} from './patient-records.component';
import { environment } from '../../../../../environments/environment';

// ─── Données de test ──────────────────────────────────────────────────────────

const mockPrescription: PrescriptionMinimalDTO = {
  prescriptionId: 10,
  note:           'Doliprane 500mg',
  date:           '2026-01-15',
  status:         'PENDING',
};

const mockPatient: PatientRecordDTO = {
  medicalFileId:         1,
  patientName:           'Ali Ben Salah',
  patientEmail:          'ali@example.com',
  medicalHistory:        '',
  chronicDisease:        'Diabète',
  repDoc:                '',
  existingPrescriptions: [mockPrescription],
};

const mockPatient2: PatientRecordDTO = {
  medicalFileId:   2,
  patientName:     'Fatma Trabelsi',
  patientEmail:    'fatma@example.com',
  medicalHistory:  '─── Visite du 01/01/2026 10:00 ───\nNotes         : Visite de contrôle',
  chronicDisease:  '',
  repDoc:          '',
};

// ─────────────────────────────────────────────────────────────────────────────
describe('PatientRecordsComponent', () => {
  let component: PatientRecordsComponent;
  let fixture:   ComponentFixture<PatientRecordsComponent>;
  let httpMock:  HttpTestingController;

  const apiBase = `${environment.baseUrl}/medical-records`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientRecordsComponent],
      imports: [FormsModule, HttpClientTestingModule],
    }).compileComponents();

    fixture   = TestBed.createComponent(PatientRecordsComponent);
    component = fixture.componentInstance;

    // On intercepte le premier appel fetch('') déclenché par ngOnInit
    fixture.detectChanges();
    const req = httpMock ? null : null; // lazy init
    httpMock = TestBed.inject(HttpTestingController);

    // Flush l'appel initial de ngOnInit
    const initReq = httpMock.expectOne(r => r.url.includes('/patients/search'));
    initReq.flush([]);
  });

  afterEach(() => {
    httpMock.verify(); // vérifie qu'aucune requête non attendue n'est en suspens
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. INITIALISATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('Initialisation', () => {

    it('doit être créé', () => {
      expect(component).toBeTruthy();
    });

    it('doit initialiser patients à un tableau vide', () => {
      expect(component.patients).toEqual([]);
    });

    it('doit initialiser showModal à false', () => {
      expect(component.showModal).toBeFalse();
    });

    it('doit initialiser searchTerm à une chaîne vide', () => {
      expect(component.searchTerm).toBe('');
    });

    it('doit initialiser tab à "form"', () => {
      expect(component.tab).toBe('form');
    });

    it('doit initialiser les listes de vaccins et examens urinaires à vide', () => {
      expect(component.form.vaccines).toEqual([]);
      expect(component.form.urinaryExams).toEqual([]);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. CHARGEMENT DES PATIENTS (fetch)
  // ══════════════════════════════════════════════════════════════════════════
  describe('fetch()', () => {

    it('doit appeler l\'API avec le bon nom encodé', () => {
      component.fetch('Ali Ben');
      const req = httpMock.expectOne(
        `${apiBase}/patients/search?name=Ali%20Ben`
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockPatient]);
    });

    it('doit remplir patients après un appel réussi', () => {
      component.fetch('Ali');
      const req = httpMock.expectOne(r => r.url.includes('/patients/search'));
      req.flush([mockPatient, mockPatient2]);
      expect(component.patients.length).toBe(2);
      expect(component.loading).toBeFalse();
    });

    it('doit afficher une erreur si l\'API échoue', () => {
      component.fetch('');
      const req = httpMock.expectOne(r => r.url.includes('/patients/search'));
      req.error(new ErrorEvent('Network error'));
      expect(component.error).toBe('Error loading patients.');
      expect(component.loading).toBeFalse();
    });

    it('doit passer loading=true pendant la requête', () => {
      component.fetch('');
      expect(component.loading).toBeTrue();
      const req = httpMock.expectOne(r => r.url.includes('/patients/search'));
      req.flush([]);
      expect(component.loading).toBeFalse();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. RECHERCHE AVEC DEBOUNCE
  // ══════════════════════════════════════════════════════════════════════════
  describe('onSearch()', () => {

    it('doit déclencher fetch après debounce', fakeAsync(() => {
      component.onSearch('Fatma');
      tick(400); // durée du debounceTime

      const req = httpMock.expectOne(r => r.url.includes('/patients/search'));
      expect(req.request.urlWithParams).toContain('Fatma');
      req.flush([mockPatient2]);
    }));

    it('ne doit pas déclencher fetch avant la fin du debounce', fakeAsync(() => {
      component.onSearch('F');
      tick(100); // pas assez
      httpMock.expectNone(r => r.url.includes('/patients/search'));
      tick(300); // total 400ms
      const req = httpMock.expectOne(r => r.url.includes('/patients/search'));
      req.flush([]);
    }));
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. OUVERTURE DU FORMULAIRE DE VISITE
  // ══════════════════════════════════════════════════════════════════════════
  describe('openForm()', () => {

    it('doit ouvrir le modal et affecter le patient sélectionné', () => {
      component.openForm(JSON.parse(JSON.stringify(mockPatient)));
      expect(component.showModal).toBeTrue();
      expect(component.sel?.medicalFileId).toEqual(mockPatient.medicalFileId);
    });

    it('doit réinitialiser le formulaire à chaque ouverture', () => {
      component.form.visitNote = 'Note précédente';
      component.form.vaccines  = [{ nom: 'BCG', type: 'A', observation: '' }];
      component.openForm(mockPatient);
      expect(component.form.visitNote).toBe('');
      expect(component.form.vaccines).toEqual([]);
    });

    it('doit passer en onglet "form"', () => {
      component.tab = 'history';
      component.openForm(mockPatient);
      expect(component.tab).toBe('form');
    });

    it('doit parser l\'historique existant du patient', () => {
      component.openForm(mockPatient2);
      expect(component.histEntries.length).toBe(1);
    });

    it('doit afficher "Jamais" si aucun historique', () => {
      component.openForm(JSON.parse(JSON.stringify(mockPatient)));
      expect(component.derniereVisite).toBe('Never');
    });

    it('doit extraire la date de la dernière visite si historique présent', () => {
      component.openForm(mockPatient2);
      expect(component.derniereVisite).toBe('01/01/2026 10:00');
    });

    it('doit réinitialiser saveSuccess et saveError', () => {
      component.saveSuccess = true;
      component.saveError   = 'Erreur précédente';
      component.openForm(JSON.parse(JSON.stringify(mockPatient)));
      expect(component.saveSuccess).toBeFalse();
      expect(component.saveError).toBe('');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. FERMETURE DU MODAL
  // ══════════════════════════════════════════════════════════════════════════
  describe('close()', () => {

    it('doit fermer le modal et vider sel', () => {
      component.openForm(mockPatient);
      component.close();
      expect(component.showModal).toBeFalse();
      expect(component.sel).toBeNull();
    });

    it('ne doit pas fermer si une sauvegarde est en cours', () => {
      component.openForm(mockPatient);
      component.saving = true;
      component.close();
      expect(component.showModal).toBeTrue();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. VALIDATION DU FORMULAIRE (formIsValid)
  // ══════════════════════════════════════════════════════════════════════════
  describe('formIsValid()', () => {

    beforeEach(() => {
      component.form = {
        filiere: '', visitNote: '', analyseSanguine: '', vaccination: '',
        prescriptions: [], autre: '', vaccines: [], appareilUrinaire: '', urinaryExams: []
      };
    });

    it('doit retourner false si tous les champs sont vides', () => {
      expect(component.formIsValid()).toBeFalse();
    });

    it('doit retourner true si visitNote est renseigné', () => {
      component.form.visitNote = 'Patient en bonne santé';
      expect(component.formIsValid()).toBeTrue();
    });

    it('doit retourner true si analyseSanguine est renseignée', () => {
      component.form.analyseSanguine = 'Glycémie normale';
      expect(component.formIsValid()).toBeTrue();
    });

    it('doit retourner true si au moins un vaccin est ajouté', () => {
      component.form.vaccines = [{ nom: 'BCG', type: 'A', observation: '' }];
      expect(component.formIsValid()).toBeTrue();
    });

    it('doit retourner true si au moins une prescription est sélectionnée', () => {
      component.form.prescriptions = ['10'];
      expect(component.formIsValid()).toBeTrue();
    });

    it('doit retourner true si autre est renseigné', () => {
      component.form.autre = 'Chute dans les escaliers';
      expect(component.formIsValid()).toBeTrue();
    });

    it('doit retourner true si appareilUrinaire est renseigné', () => {
      component.form.appareilUrinaire = 'Infection urinaire suspectée';
      expect(component.formIsValid()).toBeTrue();
    });

    it('doit retourner true si des examens urinaires sont ajoutés', () => {
      component.form.urinaryExams = [{
        libelle: 'ECBU', date: '2026-01-01', malAnt: '',
        categorie: '', nTabMp: '', dDec: '', aCausal: ''
      }];
      expect(component.formIsValid()).toBeTrue();
    });

    it('doit ignorer les champs composés uniquement d\'espaces', () => {
      component.form.visitNote = '   ';
      expect(component.formIsValid()).toBeFalse();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. PRESCRIPTIONS MULTI-SELECT
  // ══════════════════════════════════════════════════════════════════════════
  describe('Prescriptions', () => {

    it('isPrescriptionSelected() doit retourner false si non sélectionnée', () => {
      component.form.prescriptions = [];
      expect(component.isPrescriptionSelected(mockPrescription)).toBeFalse();
    });

    it('isPrescriptionSelected() doit retourner true si sélectionnée', () => {
      component.form.prescriptions = ['10'];
      expect(component.isPrescriptionSelected(mockPrescription)).toBeTrue();
    });

    it('togglePrescription() doit ajouter la prescription si absente', () => {
      component.form.prescriptions = [];
      component.togglePrescription(mockPrescription);
      expect(component.form.prescriptions).toContain('10');
    });

    it('togglePrescription() doit retirer la prescription si déjà présente', () => {
      component.form.prescriptions = ['10'];
      component.togglePrescription(mockPrescription);
      expect(component.form.prescriptions).not.toContain('10');
    });

    it('doit pouvoir sélectionner plusieurs prescriptions', () => {
      const pr2: PrescriptionMinimalDTO = { prescriptionId: 20, note: 'Note2', date: '2026-02-01', status: 'PENDING' };
      component.form.prescriptions = [];
      component.togglePrescription(mockPrescription);
      component.togglePrescription(pr2);
      expect(component.form.prescriptions.length).toBe(2);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. MODAL VACCIN
  // ══════════════════════════════════════════════════════════════════════════
  describe('Modal Vaccin', () => {

    it('openVaccineModal() doit ouvrir le modal et réinitialiser le formulaire', () => {
      component.vacForm = { nom: 'Ancien', type: 'T', observation: 'O' };
      component.openVaccineModal();
      expect(component.showVaccineModal).toBeTrue();
      expect(component.vacForm.nom).toBe('');
    });

    it('closeVaccineModal() doit fermer le modal', () => {
      component.showVaccineModal = true;
      component.closeVaccineModal();
      expect(component.showVaccineModal).toBeFalse();
    });

    it('saveVaccine() doit ajouter le vaccin à la liste', () => {
      component.form.vaccines = [];
      component.vacForm = { nom: 'ROR', type: 'Trivalent', observation: 'RAS' };
      component.saveVaccine();
      expect(component.form.vaccines.length).toBe(1);
      expect(component.form.vaccines[0].nom).toBe('ROR');
    });

    it('saveVaccine() ne doit pas ajouter si le nom est vide', () => {
      component.form.vaccines = [];
      component.vacForm = { nom: '', type: 'Trivalent', observation: '' };
      component.saveVaccine();
      expect(component.form.vaccines.length).toBe(0);
    });

    it('saveVaccine() doit fermer le modal après ajout', () => {
      component.showVaccineModal = true;
      component.vacForm = { nom: 'BCG', type: 'A', observation: '' };
      component.saveVaccine();
      expect(component.showVaccineModal).toBeFalse();
    });

    it('removeVaccine() doit retirer le vaccin à l\'index donné', () => {
      component.form.vaccines = [
        { nom: 'BCG', type: 'A', observation: '' },
        { nom: 'ROR', type: 'B', observation: '' },
      ];
      component.removeVaccine(0);
      expect(component.form.vaccines.length).toBe(1);
      expect(component.form.vaccines[0].nom).toBe('ROR');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. MODAL URINAIRE
  // ══════════════════════════════════════════════════════════════════════════
  describe('Modal Urinaire', () => {

    it('openUrinaryModal() doit ouvrir le modal et réinitialiser urForm', () => {
      component.urForm = { libelle: 'Ancien', date: '2026-01-01', malAnt: '', categorie: '', nTabMp: '', dDec: '', aCausal: '' };
      component.openUrinaryModal();
      expect(component.showUrinaryModal).toBeTrue();
      expect(component.urForm.libelle).toBe('');
    });

    it('closeUrinaryModal() doit fermer le modal', () => {
      component.showUrinaryModal = true;
      component.closeUrinaryModal();
      expect(component.showUrinaryModal).toBeFalse();
    });

    it('addUrinaryRow() doit ajouter un examen et réinitialiser urForm', () => {
      component.form.urinaryExams = [];
      component.urForm = { libelle: 'ECBU', date: '2026-01-15', malAnt: 'non', categorie: 'A', nTabMp: '1', dDec: '2026-01-20', aCausal: 'Bactérie' };
      component.addUrinaryRow();
      expect(component.form.urinaryExams.length).toBe(1);
      expect(component.form.urinaryExams[0].libelle).toBe('ECBU');
      expect(component.urForm.libelle).toBe(''); // réinitialisé
    });

    it('addUrinaryRow() ne doit pas ajouter si libellé est vide', () => {
      component.form.urinaryExams = [];
      component.urForm = { libelle: '', date: '', malAnt: '', categorie: '', nTabMp: '', dDec: '', aCausal: '' };
      component.addUrinaryRow();
      expect(component.form.urinaryExams.length).toBe(0);
    });

    it('removeUrinaryRow() doit retirer l\'examen à l\'index donné', () => {
      component.form.urinaryExams = [
        { libelle: 'ECBU', date: '2026-01-01', malAnt: '', categorie: '', nTabMp: '', dDec: '', aCausal: '' },
        { libelle: 'Créatinine', date: '2026-01-05', malAnt: '', categorie: '', nTabMp: '', dDec: '', aCausal: '' },
      ];
      component.removeUrinaryRow(0);
      expect(component.form.urinaryExams.length).toBe(1);
      expect(component.form.urinaryExams[0].libelle).toBe('Créatinine');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. VALIDATION ET ENREGISTREMENT DE LA VISITE
  // ══════════════════════════════════════════════════════════════════════════
  describe('validate()', () => {

    beforeEach(() => {
      component.sel = JSON.parse(JSON.stringify(mockPatient));
      component.form.visitNote = 'Bilan annuel';
    });

    it('ne doit pas appeler l\'API si sel est null', () => {
      component.sel = null;
      component.validate();
      httpMock.expectNone(r => r.url.includes('/history'));
    });

    it('ne doit pas appeler l\'API si le formulaire est invalide', () => {
      component.form = {
        filiere: '', visitNote: '', analyseSanguine: '', vaccination: '',
        prescriptions: [], autre: '', vaccines: [], appareilUrinaire: '', urinaryExams: []
      };
      component.validate();
      httpMock.expectNone(r => r.url.includes('/history'));
    });

    it('doit appeler POST /{medicalFileId}/history avec le bon payload', () => {
      component.validate();
      const req = httpMock.expectOne(`${apiBase}/1/history`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.visitNote).toBe('Bilan annuel');
      req.flush({ medical_historuy: '─── Visite du 01/01/2026 10:00 ───\nNotes : Bilan annuel' });
      httpMock.expectOne(r => r.url.includes('/patients/search')).flush([]);
    });

    it('doit mettre saving=true pendant la requête', () => {
      component.validate();
      expect(component.saving).toBeTrue();
      const req = httpMock.expectOne(r => r.url.includes('/history'));
      req.flush({});
      httpMock.expectOne(r => r.url.includes('/patients/search')).flush([]);
    });

    it('doit afficher saveSuccess=true après succès', () => {
      component.validate();
      const req = httpMock.expectOne(r => r.url.includes('/history'));
      req.flush({ medical_historuy: 'Visite enregistrée' });
      httpMock.expectOne(r => r.url.includes('/patients/search')).flush([]);
      expect(component.saveSuccess).toBeTrue();
      expect(component.saving).toBeFalse();
    });

    it('doit mettre à jour l\'historique du patient si le backend retourne medical_historuy', () => {
      const historique = '─── Visite du 01/01/2026 ───\nNotes : Bilan';
      component.validate();
      const req = httpMock.expectOne(r => r.url.includes('/history'));
      req.flush({ medical_historuy: historique });
      httpMock.expectOne(r => r.url.includes('/patients/search')).flush([]);
      expect(component.sel!.medicalHistory).toBe(historique);
    });

    it('doit utiliser le fallback local si medical_historuy absent de la réponse', () => {
      component.form.visitNote = 'Consultation';
      component.validate();
      const req = httpMock.expectOne(r => r.url.includes('/history'));
      req.flush({}); // pas de medical_historuy
      httpMock.expectOne(r => r.url.includes('/patients/search')).flush([]);
      expect(component.sel!.medicalHistory).toContain('Consultation');
    });

    it('doit réinitialiser le formulaire après succès', () => {
      component.validate();
      const req = httpMock.expectOne(r => r.url.includes('/history'));
      req.flush({});
      httpMock.expectOne(r => r.url.includes('/patients/search')).flush([]);
      expect(component.form.visitNote).toBe('');
      expect(component.form.vaccines).toEqual([]);
    });

    it('doit afficher saveError en cas d\'erreur HTTP', () => {
      component.validate();
      const req = httpMock.expectOne(r => r.url.includes('/history'));
      req.flush('Erreur', { status: 500, statusText: 'Internal Server Error' });
      expect(component.saveError).toContain('500');
      expect(component.saving).toBeFalse();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. PARSING DE L'HISTORIQUE
  // ══════════════════════════════════════════════════════════════════════════
  describe('parseHistory()', () => {

    it('doit retourner un tableau vide si l\'historique est vide', () => {
      expect(component.parseHistory('')).toEqual([]);
      expect(component.parseHistory('   ')).toEqual([]);
    });

    it('doit retourner une seule entrée si une seule visite', () => {
      const raw = '─── Visite du 01/01/2026 10:00 ───\nNotes : Bilan';
      expect(component.parseHistory(raw).length).toBe(1);
    });

    it('doit retourner plusieurs entrées dans l\'ordre inverse (plus récente en premier)', () => {
      const raw = [
        '─── Visite du 01/01/2026 10:00 ───\nNotes : Première visite',
        '─── Visite du 15/01/2026 14:00 ───\nNotes : Deuxième visite',
      ].join('\n\n');
      const entries = component.parseHistory(raw);
      expect(entries.length).toBe(2);
      // reverse() → la dernière visite est en premier
      expect(entries[0]).toContain('Deuxième visite');
      expect(entries[1]).toContain('Première visite');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. EXTRACTION DE LA DATE
  // ══════════════════════════════════════════════════════════════════════════
  describe('extractDate()', () => {

    it('doit extraire la date depuis une entrée valide', () => {
      const entry = '─── Visite du 15/03/2026 09:30 ───\nNotes : RAS';
      expect(component.extractDate(entry)).toBe('15/03/2026 09:30');
    });

    it('doit retourner une chaîne vide si le format ne correspond pas', () => {
      expect(component.extractDate('Entrée sans date')).toBe('');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. STRIP DATE
  // ══════════════════════════════════════════════════════════════════════════
  describe('stripDate()', () => {

    it('doit retirer la ligne d\'en-tête et retourner le contenu', () => {
      const entry = '─── Visite du 01/01/2026 10:00 ───\nNotes : Bilan';
      const result = component.stripDate(entry);
      expect(result).not.toContain('─── Visite du');
      expect(result).toContain('Notes : Bilan');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. INITIALES
  // ══════════════════════════════════════════════════════════════════════════
  describe('initials()', () => {

    it('doit retourner les deux premières initiales en majuscules', () => {
      expect(component.initials('Ali Ben Salah')).toBe('AB');
    });

    it('doit retourner les deux premiers caractères si un seul mot', () => {
      expect(component.initials('Fatma')).toBe('FA');
    });

    it('doit retourner "?" si le nom est vide', () => {
      expect(component.initials('')).toBe('?');
    });

    it('doit gérer les noms avec espaces superflus', () => {
      expect(component.initials('  Mohamed   Ali  ')).toBe('MA');
    });
  });
});