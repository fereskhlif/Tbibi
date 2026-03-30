import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TherapySessionResponse, TherapySessionRequest } from '../../models/therapy-session.model';
import { TherapySessionService } from '../../services/therapy-session.service';

@Component({
  selector: 'app-therapy-session',
  templateUrl: './therapy-session.component.html',
  styleUrls: ['./therapy-session.component.css']
})
export class TherapySessionComponent implements OnInit {
  sessions: TherapySessionResponse[] = [];
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

  constructor(private service: TherapySessionService, private router: Router) {}

  ngOnInit(): void { this.loadAll(); }

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
    if (!this.formData.patientId || !this.formData.physiotherapistId ||
        !this.formData.scheduledDate || !this.formData.startTime ||
        !this.formData.endTime || !this.formData.progressNote || !this.formData.evaluationResult) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
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