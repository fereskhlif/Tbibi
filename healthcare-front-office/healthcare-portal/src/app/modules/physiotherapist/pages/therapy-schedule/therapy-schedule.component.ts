import { Component, OnInit } from '@angular/core';
import { TherapySessionService } from '../../services/therapy-session.service';
import { TherapySessionResponse } from '../../models/therapy-session.model';

@Component({
  selector: 'app-therapy-schedule',
  templateUrl: './therapy-schedule.component.html',
  styleUrls: ['./therapy-schedule.component.css']
})
export class TherapyScheduleComponent implements OnInit {
  sessions: TherapySessionResponse[] = [];
  filteredSessions: TherapySessionResponse[] = [];
  currentPhysioId: number = 5; // ID du kinésithérapeute connecté (à récupérer depuis AuthService)
  
  filterStatus: string = 'all';
  searchTerm: string = '';
  selectedDate: string = '';
  
  showRescheduleModal: boolean = false;
  selectedSession: TherapySessionResponse | null = null;
  rescheduleForm = {
    newDate: '',
    newStartTime: '',
    newEndTime: ''
  };

  // Modal de documentation de séance
  showDocumentModal: boolean = false;
  documentForm = {
    exercisesPerformed: '',
    sessionNotes: '',
    progressNote: '',
    evaluationResult: ''
  };

  constructor(private sessionService: TherapySessionService) {}

  ngOnInit(): void {
    this.loadUpcomingSessions();
  }

  loadUpcomingSessions(): void {
    this.sessionService.getUpcomingSessions(this.currentPhysioId).subscribe({
      next: (data) => {
        this.sessions = data;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
      }
    });
  }

  applyFilters(): void {
    this.filteredSessions = this.sessions.filter(session => {
      const matchesStatus = this.filterStatus === 'all' || session.status === this.filterStatus;
      const matchesSearch = !this.searchTerm || 
        session.patientFullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (session.therapyType && session.therapyType.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesDate = !this.selectedDate || session.scheduledDate === this.selectedDate;
      
      return matchesStatus && matchesSearch && matchesDate;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  startSession(session: TherapySessionResponse): void {
    if (confirm(`Démarrer la séance avec ${session.patientFullName}?`)) {
      this.sessionService.startSession(session.sessionId).subscribe({
        next: () => {
          alert('✅ Séance démarrée avec succès!');
          this.loadUpcomingSessions();
          // Ouvrir automatiquement le modal de documentation
          this.openDocumentModal(session);
        },
        error: (err) => {
          console.error('Error starting session:', err);
          alert('❌ Erreur lors du démarrage de la séance');
        }
      });
    }
  }

  openDocumentModal(session: TherapySessionResponse): void {
    this.selectedSession = session;
    this.documentForm = {
      exercisesPerformed: session.exercisesPerformed || '',
      sessionNotes: session.sessionNotes || '',
      progressNote: session.progressNote || '',
      evaluationResult: session.evaluationResult || ''
    };
    this.showDocumentModal = true;
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
    this.selectedSession = null;
  }

  saveDocumentation(): void {
    if (!this.selectedSession) return;

    if (!this.documentForm.exercisesPerformed && !this.documentForm.sessionNotes) {
      alert('Veuillez remplir au moins les exercices ou les notes de séance');
      return;
    }

    this.sessionService.documentSession(
      this.selectedSession.sessionId,
      this.documentForm.exercisesPerformed,
      this.documentForm.sessionNotes
    ).subscribe({
      next: () => {
        alert('✅ Documentation enregistrée avec succès!');
        this.closeDocumentModal();
        this.loadUpcomingSessions();
      },
      error: (err) => {
        console.error('Error documenting session:', err);
        alert('❌ Erreur lors de l\'enregistrement de la documentation');
      }
    });
  }

  completeSession(session: TherapySessionResponse): void {
    this.selectedSession = session;
    
    // Si la séance n'a pas de documentation, ouvrir le modal
    if (!session.exercisesPerformed && !session.sessionNotes) {
      this.openDocumentModal(session);
      return;
    }

    // Sinon, terminer directement
    if (confirm(`Terminer la séance avec ${session.patientFullName}?`)) {
      this.sessionService.completeSession(session.sessionId, this.documentForm).subscribe({
        next: () => {
          alert('✅ Séance terminée avec succès!');
          this.loadUpcomingSessions();
        },
        error: (err) => {
          console.error('Error completing session:', err);
          alert('❌ Erreur lors de la finalisation de la séance');
        }
      });
    }
  }

  completeSessionFromModal(): void {
    if (!this.selectedSession) return;

    this.sessionService.completeSession(this.selectedSession.sessionId, this.documentForm).subscribe({
      next: () => {
        alert('✅ Séance terminée avec succès!');
        this.closeDocumentModal();
        this.loadUpcomingSessions();
      },
      error: (err) => {
        console.error('Error completing session:', err);
        alert('❌ Erreur lors de la finalisation de la séance');
      }
    });
  }

  openRescheduleModal(session: TherapySessionResponse): void {
    this.selectedSession = session;
    this.rescheduleForm = {
      newDate: session.scheduledDate,
      newStartTime: session.startTime,
      newEndTime: session.endTime
    };
    this.showRescheduleModal = true;
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal = false;
    this.selectedSession = null;
  }

  rescheduleSession(): void {
    if (!this.selectedSession) return;

    if (!this.rescheduleForm.newDate || !this.rescheduleForm.newStartTime || !this.rescheduleForm.newEndTime) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.sessionService.rescheduleSession(
      this.selectedSession.sessionId,
      this.rescheduleForm.newDate,
      this.rescheduleForm.newStartTime,
      this.rescheduleForm.newEndTime
    ).subscribe({
      next: () => {
        alert('✅ Séance reprogrammée avec succès!');
        this.closeRescheduleModal();
        this.loadUpcomingSessions();
      },
      error: (err) => {
        console.error('Error rescheduling session:', err);
        alert('❌ Erreur lors de la reprogrammation');
      }
    });
  }

  cancelSession(session: TherapySessionResponse): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler la séance avec ${session.patientFullName}?`)) {
      this.sessionService.cancelSession(session.sessionId).subscribe({
        next: () => {
          alert('✅ Séance annulée avec succès!');
          this.loadUpcomingSessions();
        },
        error: (err) => {
          console.error('Error cancelling session:', err);
          alert('❌ Erreur lors de l\'annulation');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Scheduled': 'status-scheduled',
      'In Progress': 'status-in-progress',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled',
      'Rescheduled': 'status-rescheduled'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusBadgeClass(status: string): string {
    const badgeMap: { [key: string]: string } = {
      'Scheduled': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-green-100 text-green-700',
      'Completed': 'bg-gray-100 text-gray-700',
      'Cancelled': 'bg-red-100 text-red-700',
      'Rescheduled': 'bg-yellow-100 text-yellow-700'
    };
    return badgeMap[status] || 'bg-gray-100 text-gray-700';
  }

  formatDuration(session: TherapySessionResponse): string {
    if (session.durationMinutes) {
      return `${session.durationMinutes} min`;
    }
    // Calculer la durée à partir des heures de début et fin
    const start = new Date(`2000-01-01T${session.startTime}`);
    const end = new Date(`2000-01-01T${session.endTime}`);
    const diff = (end.getTime() - start.getTime()) / 60000; // en minutes
    return `${diff} min`;
  }
}
