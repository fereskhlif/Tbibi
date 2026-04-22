import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TherapySessionResponse, TherapySessionRequest } from '../../models/therapy-session.model';
import { TherapySessionService } from '../../services/therapy-session.service';

interface Patient {
  userId: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-therapy-session',
  templateUrl: './therapy-session.component.html',
  styleUrls: ['./therapy-session.component.css']
})
export class TherapySessionComponent implements OnInit {
  sessions: TherapySessionResponse[] = [];
  patients: Patient[] = [];
  currentPhysioId: number = 0;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  showForm = false;
  isEditMode = false;
  isSaving = false;
  editingId: number | null = null;

  formData = {
    progressNote: '',
    scheduledDate: '',
    evaluationResult: '',
    startTime: '',
    endTime: '',
    patientId: null as number | null,
    physiotherapistId: null as number | null
  };

  private apiUrl = 'http://localhost:8088/api';

  constructor(
    private service: TherapySessionService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Get the logged-in physiotherapist's ID from localStorage
    this.currentPhysioId = Number(localStorage.getItem('userId') || '0');
    if (this.currentPhysioId === 0) {
      console.error('No user ID found in localStorage');
      return;
    }
    this.loadAll();
    this.loadPatients();
  }

  loadPatients(): void {
    this.http.get<Patient[]>(`${this.apiUrl}/users/patients`)
      .subscribe({
        next: (data) => {
          this.patients = data;
        },
        error: (err) => console.error('Error loading patients:', err)
      });
  }

  loadAll(): void {
    this.isLoading = true;
    this.service.getAll().subscribe({
      next: (data: TherapySessionResponse[]) => { this.sessions = data; this.isLoading = false; },
      error: () => { this.errorMessage = 'Erreur de chargement des séances.'; this.isLoading = false; }
    });
  }

  get filteredSessions(): TherapySessionResponse[] {
    if (!this.searchTerm.trim()) return this.sessions;
    const t = this.searchTerm.toLowerCase();
    return this.sessions.filter((s: TherapySessionResponse) =>
      s.patientFullName?.toLowerCase().includes(t) ||
      s.physiotherapistFullName?.toLowerCase().includes(t) ||
      s.evaluationResult?.toLowerCase().includes(t) ||
      s.progressNote?.toLowerCase().includes(t)
    );
  }

  openCreateForm(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.resetForm();
    // Auto-set physiotherapist ID to current logged-in user
    this.formData.physiotherapistId = this.currentPhysioId;
    this.showForm = true;
  }

  openEditForm(session: TherapySessionResponse): void {
    this.isEditMode = true;
    this.editingId = session.sessionId;
    this.formData = {
      progressNote: session.progressNote || '',
      scheduledDate: session.scheduledDate,
      evaluationResult: session.evaluationResult || '',
      startTime: session.startTime,
      endTime: session.endTime,
      patientId: session.patientId,
      physiotherapistId: session.physiotherapistId
    };
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; this.resetForm(); }

  resetForm(): void {
    this.formData = {
      progressNote: '', scheduledDate: '', evaluationResult: '',
      startTime: '', endTime: '', patientId: null, physiotherapistId: null
    };
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.formData.patientId ||
        !this.formData.scheduledDate || !this.formData.startTime ||
        !this.formData.endTime || !this.formData.progressNote || !this.formData.evaluationResult) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    // Ensure physiotherapist ID is set
    if (!this.formData.physiotherapistId) {
      this.formData.physiotherapistId = this.currentPhysioId;
    }

    this.isSaving = true;
    this.errorMessage = '';
    const payload: TherapySessionRequest = {
      progressNote: this.formData.progressNote,
      scheduledDate: this.formData.scheduledDate,
      evaluationResult: this.formData.evaluationResult,
      startTime: this.formData.startTime,
      endTime: this.formData.endTime,
      patientId: this.formData.patientId!,
      physiotherapistId: this.formData.physiotherapistId!
    };

    const req$ = this.isEditMode && this.editingId
      ? this.service.update(this.editingId, payload)
      : this.service.create(payload);

    req$.subscribe({
      next: (_: TherapySessionResponse) => {
        this.successMessage = this.isEditMode ? 'Séance mise à jour !' : 'Séance créée !';
        this.isSaving = false;
        this.showForm = false;
        this.loadAll();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.errorMessage = 'Erreur lors de la sauvegarde.'; this.isSaving = false; }
    });
  }

  onDelete(id: number): void {
    if (confirm('Supprimer cette séance de thérapie ?')) {
      this.service.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Séance supprimée.';
          this.loadAll();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => { this.errorMessage = 'Erreur lors de la suppression.'; }
      });
    }
  }

  getDuration(start: string, end: string): string {
    if (!start || !end) return '-';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const total = (eh * 60 + em) - (sh * 60 + sm);
    return total > 0 ? `${total} min` : '-';
  }
}