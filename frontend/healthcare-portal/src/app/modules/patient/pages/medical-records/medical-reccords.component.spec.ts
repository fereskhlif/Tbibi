import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { MedicalRecordsComponent } from './medical-records.component';
import { MedicalRecordsServiceService } from '../../../../services/medical-records-service.service';

// ─── Mock du service ──────────────────────────────────────────────────────────
const mockService = {
  getAll:             jasmine.createSpy('getAll').and.returnValue(of([])),
  add:                jasmine.createSpy('add'),
  updateMyRecord:     jasmine.createSpy('updateMyRecord'),
  delete:             jasmine.createSpy('delete'),
  uploadPatientImage: jasmine.createSpy('uploadPatientImage'),
  deletePatientImage: jasmine.createSpy('deletePatientImage'),
};

// ─── Données de test ──────────────────────────────────────────────────────────
const mockRecord = {
  medicalfile_id:   1,
  imageLabo:        'Labo Central',
  result_ia:        'Normal',
  medical_historuy: 'Historique court',
  chronic_diseas:   'Diabète',
  imageUrl:         null,
  patientImages:    [],
  rep_doc:          '',
  icon:             '🏥',
  bgColor:          'bg-blue-50',
  status:           'Active',
  statusClass:      'bg-blue-100 text-blue-700',
  type:             'Lab Reports',
  healthScore:      80,
};

const mockRecordAbnormal = {
  ...mockRecord,
  medicalfile_id:   2,
  result_ia:        'abnormal result',
  chronic_diseas:   'Asthme',
  medical_historuy: 'Un historique très long qui dépasse les cinquante caractères pour tester la pénalité',
  healthScore:      40,
};

// ─────────────────────────────────────────────────────────────────────────────
describe('MedicalRecordsComponent', () => {
  let component: MedicalRecordsComponent;
  let fixture:   ComponentFixture<MedicalRecordsComponent>;

  beforeEach(async () => {
    mockService.getAll.calls.reset();
    mockService.add.calls.reset();
    mockService.updateMyRecord.calls.reset();
    mockService.delete.calls.reset();
    mockService.uploadPatientImage.calls.reset();
    mockService.deletePatientImage.calls.reset();

    mockService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [MedicalRecordsComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [{ provide: MedicalRecordsServiceService, useValue: mockService }]
    }).compileComponents();

    fixture   = TestBed.createComponent(MedicalRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. INITIALISATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('Initialisation', () => {

    it('doit être créé', () => {
      expect(component).toBeTruthy();
    });

    it('doit appeler loadRecords() au démarrage', () => {
      expect(mockService.getAll).toHaveBeenCalledTimes(1);
    });

    it('doit initialiser activeFilter à "All"', () => {
      expect(component.activeFilter).toBe('All');
    });

    it('doit initialiser records à un tableau vide', () => {
      expect(component.records).toEqual([]);
    });

    it('doit initialiser showForm à false', () => {
      expect(component.showForm).toBeFalse();
    });

    it('doit initialiser showActeForm à false', () => {
      expect(component.showActeForm).toBeFalse();
    });

    it('doit initialiser isEditing à false', () => {
      expect(component.isEditing).toBeFalse();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. CHARGEMENT DES RECORDS
  // ══════════════════════════════════════════════════════════════════════════
  describe('loadRecords()', () => {

    it('doit charger les records et enrichir les champs manquants', () => {
      const rawRecord = {
        medicalfile_id: 10, imageLabo: 'Labo A',
        result_ia: 'Normal', medical_historuy: 'Court', chronic_diseas: '',
      };
      mockService.getAll.and.returnValue(of([rawRecord]));
      component.loadRecords();
      expect(component.records.length).toBe(1);
      expect(component.records[0].icon).toBe('🏥');
      expect(component.records[0].status).toBe('Active');
      expect(component.records[0].healthScore).toBeDefined();
      expect(component.errorMessage).toBe('');
    });

    it('doit afficher un message d\'erreur en cas d\'échec', () => {
      mockService.getAll.and.returnValue(throwError(() => ({ status: 500 })));
      component.loadRecords();
      expect(component.errorMessage).toBe('Impossible de charger les dossiers médicaux.');
      expect(component.records).toEqual([]);
    });

    it('doit gérer une réponse null sans erreur', () => {
      mockService.getAll.and.returnValue(of(null as any));
      component.loadRecords();
      expect(component.records).toEqual([]);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SCORE DE SANTÉ
  // ══════════════════════════════════════════════════════════════════════════
  describe('computeHealthScore()', () => {

    it('doit retourner 100 pour un patient sans anomalie', () => {
      expect(component.computeHealthScore({ chronic_diseas: '', medical_historuy: 'Court', result_ia: 'Normal' })).toBe(100);
    });

    it('doit déduire 20 points si maladie chronique présente', () => {
      expect(component.computeHealthScore({ chronic_diseas: 'Diabète', medical_historuy: 'Court', result_ia: 'Normal' })).toBe(80);
    });

    it('doit déduire 10 points si historique > 50 caractères', () => {
      expect(component.computeHealthScore({
        chronic_diseas: '',
        medical_historuy: 'Historique très long qui dépasse bien les cinquante caractères ici',
        result_ia: 'Normal'
      })).toBe(90);
    });

    it('doit déduire 30 points si result_ia contient "abnormal"', () => {
      expect(component.computeHealthScore({ chronic_diseas: '', medical_historuy: 'Court', result_ia: 'abnormal finding' })).toBe(70);
    });

    it('doit déduire 30 points si result_ia contient "élevé" (casse mixte)', () => {
      expect(component.computeHealthScore({ chronic_diseas: '', medical_historuy: 'Court', result_ia: 'Taux Élevé détecté' })).toBe(70);
    });

    it('doit cumuler les pénalités (chronique −20, historique long −10, abnormal −30) = 40', () => {
      const score = component.computeHealthScore({
        chronic_diseas:   'Asthme',
        medical_historuy: 'Historique très long qui dépasse bien les cinquante caractères',
        result_ia:        'abnormal'
      });
      expect(score).toBe(40);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('ne doit jamais descendre sous 0', () => {
      const score = component.computeHealthScore({
        chronic_diseas:   'Diabète',
        medical_historuy: 'Historique très long qui dépasse bien les cinquante caractères ici',
        result_ia:        'abnormal positive risque élevé'
      });
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('ne doit pas dépasser 100', () => {
      expect(component.computeHealthScore({ chronic_diseas: '', medical_historuy: '', result_ia: '' })).toBeLessThanOrEqual(100);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. COULEUR ET LABEL DU SCORE
  // ══════════════════════════════════════════════════════════════════════════
  describe('getScoreColor()', () => {

    it('doit retourner text-green-600 pour un score >= 75', () => {
      expect(component.getScoreColor(100)).toBe('text-green-600');
      expect(component.getScoreColor(75)).toBe('text-green-600');
    });

    it('doit retourner text-yellow-500 pour un score entre 50 et 74', () => {
      expect(component.getScoreColor(74)).toBe('text-yellow-500');
      expect(component.getScoreColor(50)).toBe('text-yellow-500');
    });

    it('doit retourner text-red-600 pour un score < 50', () => {
      expect(component.getScoreColor(49)).toBe('text-red-600');
      expect(component.getScoreColor(0)).toBe('text-red-600');
    });
  });

  describe('getScoreLabel()', () => {

    it('doit retourner "Good" pour score >= 75', () => {
      expect(component.getScoreLabel(75)).toBe('Good');
      expect(component.getScoreLabel(100)).toBe('Good');
    });

    it('doit retourner "Fair" pour score entre 50 et 74', () => {
      expect(component.getScoreLabel(50)).toBe('Fair');
      expect(component.getScoreLabel(74)).toBe('Fair');
    });

    it('doit retourner "At Risk" pour score < 50', () => {
      expect(component.getScoreLabel(0)).toBe('At Risk');
      expect(component.getScoreLabel(49)).toBe('At Risk');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. FILTRAGE
  // ══════════════════════════════════════════════════════════════════════════
  describe('filteredRecords', () => {

    beforeEach(() => {
      component.records = [
        { ...mockRecord, type: 'Lab Reports' },
        { ...mockRecord, medicalfile_id: 2, type: 'Scan' },
        { ...mockRecord, medicalfile_id: 3, type: 'Lab Reports' },
      ];
    });

    it('doit retourner tous les records quand activeFilter = "All"', () => {
      component.activeFilter = 'All';
      expect(component.filteredRecords.length).toBe(3);
    });

    it('doit filtrer par type quand activeFilter est spécifique', () => {
      component.activeFilter = 'Lab Reports';
      expect(component.filteredRecords.length).toBe(2);
    });

    it('doit retourner un tableau vide si aucun record ne correspond', () => {
      component.activeFilter = 'Inexistant';
      expect(component.filteredRecords.length).toBe(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. SÉLECTION D'UN RECORD
  // ══════════════════════════════════════════════════════════════════════════
  describe('viewRecord()', () => {

    it('doit affecter le record à selectedRecord', () => {
      component.viewRecord(mockRecord);
      expect(component.selectedRecord).toEqual(mockRecord);
    });

    it('doit remplacer un selectedRecord existant', () => {
      component.selectedRecord = { ...mockRecord, medicalfile_id: 99 };
      component.viewRecord(mockRecord);
      expect(component.selectedRecord.medicalfile_id).toBe(1);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. FORMULAIRE ADD
  // ══════════════════════════════════════════════════════════════════════════
  describe('openAddForm()', () => {

    it('doit ouvrir le formulaire en mode création', () => {
      component.openAddForm();
      expect(component.showForm).toBeTrue();
      expect(component.isEditing).toBeFalse();
    });

    it('doit réinitialiser tous les champs d\'état', () => {
      component.imagePreviewUrl   = 'data:image/png;base64,abc';
      component.selectedImageFile = new File([''], 'test.png');
      component.editId            = 42;
      component.openAddForm();
      expect(component.imagePreviewUrl).toBeNull();
      expect(component.selectedImageFile).toBeNull();
      expect(component.editId).toBeNull();
      expect(component.editIndex).toBeNull();
    });

    it('doit réinitialiser le formulaire', () => {
      component.formMedicalRecord.patchValue({ medical_historuy: 'hist', chronic_diseas: '' });
      component.openAddForm();
      expect(component.formMedicalRecord.value.medical_historuy).toBeNull();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. FORMULAIRE EDIT
  // ── openEditForm ne prend plus d'index (signature: openEditForm(record))
  // ══════════════════════════════════════════════════════════════════════════
  describe('openEditForm()', () => {

    it('doit ouvrir le formulaire en mode édition', () => {
      component.openEditForm(mockRecord);
      expect(component.showForm).toBeTrue();
      expect(component.isEditing).toBeTrue();
    });

    it('doit remplir le formulaire avec les données du record', () => {
      component.openEditForm(mockRecord);
      expect(component.formMedicalRecord.value.medical_historuy).toBe('Historique court');
      expect(component.formMedicalRecord.value.chronic_diseas).toBe('Diabète');
    });

    it('doit mémoriser l\'id du record édité', () => {
      component.openEditForm(mockRecord);
      expect(component.editId).toBe(1);
    });

    it('editIndex doit être null (non utilisé dans cette version)', () => {
      component.openEditForm(mockRecord);
      expect(component.editIndex).toBeNull();
    });

    it('doit récupérer l\'imageUrl existante comme prévisualisation', () => {
      component.openEditForm({ ...mockRecord, imageUrl: 'http://example.com/img.png' });
      expect(component.imagePreviewUrl).toBe('http://example.com/img.png');
    });

    it('doit mettre imagePreviewUrl à null si le record n\'a pas d\'image', () => {
      component.openEditForm({ ...mockRecord, imageUrl: undefined });
      expect(component.imagePreviewUrl).toBeNull();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ANNULATION DU FORMULAIRE
  // ══════════════════════════════════════════════════════════════════════════
  describe('cancelForm()', () => {

    it('doit fermer le formulaire et réinitialiser l\'état complet', () => {
      component.openEditForm(mockRecord);
      component.cancelForm();
      expect(component.showForm).toBeFalse();
      expect(component.isEditing).toBeFalse();
      expect(component.editIndex).toBeNull();
      expect(component.editId).toBeNull();
      expect(component.selectedImageFile).toBeNull();
      expect(component.imagePreviewUrl).toBeNull();
    });

    it('doit réinitialiser le formulaire réactif', () => {
      component.openEditForm(mockRecord);
      component.cancelForm();
      expect(component.formMedicalRecord.value.medical_historuy).toBeNull();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. VALIDATION DU FORMULAIRE RÉACTIF
  // ── imageLabo et result_ia sont désormais sans Validators.required
  // ══════════════════════════════════════════════════════════════════════════
  describe('formMedicalRecord validation', () => {

    it('doit être invalide si medical_historuy est < 4 caractères', () => {
      component.formMedicalRecord.patchValue({ medical_historuy: 'ab' });
      expect(component.formMedicalRecord.controls['medical_historuy'].invalid).toBeTrue();
    });

    it('doit être valide avec medical_historuy >= 4 caractères', () => {
      component.formMedicalRecord.patchValue({ medical_historuy: 'Historique valide' });
      expect(component.formMedicalRecord.valid).toBeTrue();
    });

    it('chronic_diseas est optionnel', () => {
      component.formMedicalRecord.patchValue({ medical_historuy: 'Historique valide', chronic_diseas: '' });
      expect(component.formMedicalRecord.valid).toBeTrue();
    });

    it('imageLabo est optionnel (lecture seule, pas de validator required)', () => {
      component.formMedicalRecord.patchValue({ imageLabo: '', medical_historuy: 'Historique valide' });
      expect(component.formMedicalRecord.valid).toBeTrue();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. SAUVEGARDE — CRÉATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('saveForm() — création', () => {

    beforeEach(() => {
      component.formMedicalRecord.patchValue({ medical_historuy: 'Historique valide', chronic_diseas: '' });
      component.isEditing = false;
    });

    it('ne doit pas appeler add() si le formulaire est invalide', () => {
      component.formMedicalRecord.patchValue({ medical_historuy: 'ab' }); // < 4 chars
      component.saveForm();
      expect(mockService.add).not.toHaveBeenCalled();
    });

    it('doit appeler service.add() avec le bon payload', () => {
      mockService.add.and.returnValue(of({ medicalfile_id: 99 }));
      component.saveForm();
      expect(mockService.add).toHaveBeenCalledTimes(1);
    });

    it('doit inclure imageUrl dans le payload si une image est choisie', () => {
      mockService.add.and.returnValue(of({ medicalfile_id: 99 }));
      component.imagePreviewUrl = 'data:image/png;base64,abc123';
      component.saveForm();
      const payload = mockService.add.calls.mostRecent().args[0];
      expect(payload.imageUrl).toBe('data:image/png;base64,abc123');
    });

    it('doit ajouter le nouveau record en tête de liste', () => {
      mockService.add.and.returnValue(of({ medicalfile_id: 99, type: 'Lab Reports' }));
      component.records = [mockRecord];
      component.saveForm();
      expect(component.records.length).toBe(2);
      expect(component.records[0].medicalfile_id).toBe(99);
    });

    it('doit fermer le formulaire après succès', () => {
      mockService.add.and.returnValue(of({ medicalfile_id: 99 }));
      component.saveForm();
      expect(component.showForm).toBeFalse();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. SAUVEGARDE — ÉDITION
  // ══════════════════════════════════════════════════════════════════════════
  describe('saveForm() — édition', () => {

    beforeEach(() => {
      component.isEditing = true;
      component.editId    = 1;
      component.editIndex = null; // plus utilisé dans cette version
      component.records   = [{ ...mockRecord }];
      component.formMedicalRecord.patchValue({
        medical_historuy: 'Historique modifié', chronic_diseas: ''
      });
    });

    it('doit appeler service.updateMyRecord()', () => {
      mockService.updateMyRecord.and.returnValue(of({ ...mockRecord }));
      component.saveForm();
      expect(mockService.updateMyRecord).toHaveBeenCalledTimes(1);
    });

    it('doit mettre à jour le record correspondant dans la liste par medicalfile_id', () => {
      mockService.updateMyRecord.and.returnValue(of({ ...mockRecord, medical_historuy: 'Historique modifié', type: 'Lab Reports' }));
      component.saveForm();
      expect(component.records[0].medical_historuy).toBe('Historique modifié');
    });

    it('doit mettre à jour selectedRecord si le même record est affiché', () => {
      component.selectedRecord = { ...mockRecord };
      mockService.updateMyRecord.and.returnValue(of({ ...mockRecord, type: 'Lab Reports' }));
      component.saveForm();
      expect(component.selectedRecord).toBeDefined();
    });

    it('doit fermer le formulaire après succès', () => {
      mockService.updateMyRecord.and.returnValue(of({ ...mockRecord }));
      component.saveForm();
      expect(component.showForm).toBeFalse();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. SUPPRESSION D'UN RECORD
  // ── deleteRecord(record) prend l'objet entier, plus l'index
  // ══════════════════════════════════════════════════════════════════════════
  describe('deleteRecord()', () => {

    beforeEach(() => {
      component.records = [{ ...mockRecord }, { ...mockRecordAbnormal }];
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('doit appeler service.delete() avec le bon id', () => {
      mockService.delete.and.returnValue(of(void 0));
      component.deleteRecord(mockRecord);
      expect(mockService.delete).toHaveBeenCalledWith(1);
    });

    it('doit retirer le record de la liste par medicalfile_id', () => {
      mockService.delete.and.returnValue(of(void 0));
      component.deleteRecord(mockRecord);
      expect(component.records.length).toBe(1);
      expect(component.records[0].medicalfile_id).toBe(2);
    });

    it('doit fermer le modal de détail si le record supprimé était sélectionné', () => {
      component.selectedRecord = { ...mockRecord };
      mockService.delete.and.returnValue(of(void 0));
      component.deleteRecord(mockRecord);
      expect(component.selectedRecord).toBeNull();
    });

    it('ne doit pas supprimer si l\'utilisateur annule la confirmation', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.deleteRecord(mockRecord);
      expect(mockService.delete).not.toHaveBeenCalled();
      expect(component.records.length).toBe(2);
    });

    it('doit créer un nouveau tableau (pas de mutation en place)', () => {
      mockService.delete.and.returnValue(of(void 0));
      const refAvant = component.records;
      component.deleteRecord(mockRecord);
      // filter() crée un nouveau tableau → la référence change
      expect(component.records).not.toBe(refAvant);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. GESTION DE L'IMAGE
  // ══════════════════════════════════════════════════════════════════════════
  describe('removeImage()', () => {

    it('doit vider imagePreviewUrl et selectedImageFile', () => {
      component.imagePreviewUrl   = 'data:image/png;base64,abc';
      component.selectedImageFile = new File([''], 'test.png');
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      component.removeImage(event);
      expect(component.imagePreviewUrl).toBeNull();
      expect(component.selectedImageFile).toBeNull();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('onImageChange()', () => {

    it('doit ignorer un fichier non-image', () => {
      const file  = new File([''], 'doc.pdf', { type: 'application/pdf' });
      const event = { target: { files: [file] } as unknown as HTMLInputElement } as unknown as Event;
      component.onImageChange(event);
      expect(component.selectedImageFile).toBeNull();
      expect(component.imagePreviewUrl).toBeNull();
    });

    it('doit accepter un fichier image et l\'affecter à selectedImageFile', () => {
      const file  = new File(['content'], 'photo.png', { type: 'image/png' });
      const event = { target: { files: [file] } as unknown as HTMLInputElement } as unknown as Event;
      component.onImageChange(event);
      expect(component.selectedImageFile).toBe(file);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 15. DOCUMENTS PATIENT
  // ══════════════════════════════════════════════════════════════════════════
  describe('uploadPatientImage()', () => {

    beforeEach(() => {
      component.selectedRecord = { ...mockRecord };
      spyOn(window, 'alert');
    });

    it('doit rejeter un format non supporté', () => {
      const file = new File([''], 'doc.txt', { type: 'text/plain' });
      component.uploadPatientImage(file);
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Format non supporté'));
      expect(mockService.uploadPatientImage).not.toHaveBeenCalled();
    });

    it('doit rejeter un fichier > 10 Mo', () => {
      const file = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
      component.uploadPatientImage(file);
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('trop grand'));
      expect(mockService.uploadPatientImage).not.toHaveBeenCalled();
    });

    it('doit appeler service.uploadPatientImage() avec le fichier', () => {
      const file = new File(['data'], 'scan.jpg', { type: 'image/jpeg' });
      mockService.uploadPatientImage.and.returnValue(of({ medicalfile_id: 1, patientImages: ['/uploads/scan.jpg'] }));
      component.uploadPatientImage(file);
      expect(mockService.uploadPatientImage).toHaveBeenCalledWith(file);
    });

    it('doit mettre à jour patientImages du selectedRecord après upload', () => {
      const file = new File(['data'], 'scan.jpg', { type: 'image/jpeg' });
      mockService.uploadPatientImage.and.returnValue(of({ medicalfile_id: 1, patientImages: ['/uploads/scan.jpg'] }));
      component.uploadPatientImage(file);
      expect(component.selectedRecord.patientImages).toEqual(['/uploads/scan.jpg']);
    });

    it('doit gérer l\'erreur d\'upload sans planter', () => {
      const file = new File(['data'], 'scan.jpg', { type: 'image/jpeg' });
      mockService.uploadPatientImage.and.returnValue(throwError(() => ({ status: 500 })));
      expect(() => component.uploadPatientImage(file)).not.toThrow();
      expect(component.isUploadingPatientImage).toBeFalse();
    });
  });

  describe('deletePatientImage()', () => {

    beforeEach(() => {
      component.selectedRecord = { ...mockRecord, patientImages: ['/uploads/scan.jpg', '/uploads/radio.png'] };
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
    });

    it('doit appeler service.deletePatientImage() avec le bon chemin', () => {
      mockService.deletePatientImage.and.returnValue(of({}));
      component.deletePatientImage('/uploads/scan.jpg', new Event('click'));
      expect(mockService.deletePatientImage).toHaveBeenCalledWith('/uploads/scan.jpg');
    });

    it('doit retirer l\'image supprimée de patientImages', () => {
      mockService.deletePatientImage.and.returnValue(of({}));
      component.deletePatientImage('/uploads/scan.jpg', new Event('click'));
      expect(component.selectedRecord.patientImages).toEqual(['/uploads/radio.png']);
    });

    it('ne doit pas appeler le service si l\'utilisateur annule', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.deletePatientImage('/uploads/scan.jpg', new Event('click'));
      expect(mockService.deletePatientImage).not.toHaveBeenCalled();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 16. FORMULAIRE ACTE
  // ══════════════════════════════════════════════════════════════════════════
  describe('Formulaire Acte', () => {

    it('openAddActeForm() doit ouvrir le modal et pré-remplir la date', () => {
      component.openAddActeForm(mockRecord);
      expect(component.showActeForm).toBeTrue();
      expect(component.selectedRecordForActe).toEqual(mockRecord);
      expect(component.acteForm.date).toBeTruthy();
    });

    it('cancelActeForm() doit fermer le modal et réinitialiser l\'état', () => {
      component.openAddActeForm(mockRecord);
      component.cancelActeForm();
      expect(component.showActeForm).toBeFalse();
      expect(component.selectedRecordForActe).toBeNull();
      expect(component.acteForm.description).toBe('');
    });

    it('saveActe() ne doit rien faire si aucun record n\'est sélectionné', () => {
      const httpSpy = spyOn((component as any).http, 'post');
      component.selectedRecordForActe = null;
      component.saveActe();
      expect(httpSpy).not.toHaveBeenCalled();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 17. UTILITAIRES FICHIERS
  // ══════════════════════════════════════════════════════════════════════════
  describe('isPdf()', () => {
    it('doit retourner true pour un chemin .pdf', () => {
      expect(component.isPdf('/uploads/rapport.pdf')).toBeTrue();
      expect(component.isPdf('/uploads/RAPPORT.PDF')).toBeTrue();
    });
    it('doit retourner false pour une image', () => {
      expect(component.isPdf('/uploads/scan.jpg')).toBeFalse();
    });
  });

  describe('getFileName()', () => {
    it('doit extraire le nom de fichier depuis un chemin', () => {
      expect(component.getFileName('/uploads/patient/scan.jpg')).toBe('scan.jpg');
    });
    it('doit retourner le chemin tel quel s\'il n\'y a pas de /', () => {
      expect(component.getFileName('scan.jpg')).toBe('scan.jpg');
    });
  });

  describe('getFileLabel()', () => {
    it('doit tronquer les noms longs', () => {
      const label = component.getFileLabel('/uploads/' + 'a'.repeat(35) + '.jpg');
      expect(label.endsWith('...')).toBeTrue();
      expect(label.length).toBeLessThanOrEqual(30);
    });
    it('ne doit pas tronquer les noms courts', () => {
      expect(component.getFileLabel('/uploads/scan.jpg')).toBe('scan.jpg');
    });
  });

  describe('getImageUrl()', () => {
    it('doit retourner une chaîne vide si path est vide', () => {
      expect(component.getImageUrl('')).toBe('');
    });
    it('doit retourner l\'URL telle quelle si elle commence par http', () => {
      expect(component.getImageUrl('http://cdn.example.com/img.png')).toBe('http://cdn.example.com/img.png');
    });
    it('doit préfixer le baseUrl pour un chemin relatif', () => {
      expect(component.getImageUrl('/uploads/scan.jpg')).toContain('/uploads/scan.jpg');
    });
  });
});