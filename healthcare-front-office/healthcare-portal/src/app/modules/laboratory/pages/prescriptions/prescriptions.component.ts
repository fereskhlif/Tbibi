import { Component, OnInit } from '@angular/core';
import {
  PrescriptionResponse,
  PrescriptionService,
  PrescriptionStatus,
  STATUS_META,
} from '../../../../services/prescription-service.service';

const ANALYSIS_TYPE_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  ANALYSE_DIAGNOSTIQUE:    { label: 'Analyses médicales diagnostiques', icon: '🔬', color: '#3b82f6', bg: '#dbeafe' },
  ANALYSE_MICROBIOLOGIQUE: { label: 'Analyses microbiologiques',         icon: '🦠', color: '#8b5cf6', bg: '#ede9fe' },
  EXAMEN_ANATOMOPATHOLOGIQUE: { label: 'Examens anatomopathologiques',   icon: '🧬', color: '#10b981', bg: '#d1fae5' },
  TEST_GENETIQUE:          { label: 'Tests génétiques',                  icon: '🧪', color: '#f59e0b', bg: '#fef3c7' },
  ANALYSE:                 { label: 'Analyse',                           icon: '🔬', color: '#3b82f6', bg: '#dbeafe' },
};

@Component({
  selector: 'app-lab-prescriptions',
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.css']
})
export class LabPrescriptionsComponent implements OnInit {
  prescriptions: (PrescriptionResponse & { expanded?: boolean; acteType?: string })[] = [];
  loading = false;
  error = '';

  activeTypeFilter = 'ALL';
  activeStatusFilter: PrescriptionStatus | 'ALL' = 'ALL';

  STATUS_META = STATUS_META;
  ANALYSIS_TYPE_META = ANALYSIS_TYPE_META;

  readonly statusKeys: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'COMPLETED', 'CANCELLED'];
  readonly analysisTypeKeys = Object.keys(ANALYSIS_TYPE_META).filter(k => k !== 'ANALYSE');

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.prescriptionService.getAnalysisPrescriptions().subscribe({
      next: (data) => {
        this.prescriptions = data.map(rx => ({ ...rx, expanded: false }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des prescriptions d\'analyse.';
        this.loading = false;
      }
    });
  }

  get filtered() {
    return this.prescriptions.filter(rx => {
      const typeMatch = this.activeTypeFilter === 'ALL' || this.getActeType(rx) === this.activeTypeFilter;
      const statusMatch = this.activeStatusFilter === 'ALL' || rx.status === this.activeStatusFilter;
      return typeMatch && statusMatch;
    });
  }

  countByType(key: string): number {
    return this.prescriptions.filter(rx => this.getActeType(rx) === key).length;
  }

  countByStatus(s: PrescriptionStatus): number {
    return this.prescriptions.filter(rx => rx.status === s).length;
  }

  getAnalysisMeta(rx: any) {
    const type = this.getActeType(rx);
    return ANALYSIS_TYPE_META[type] ?? ANALYSIS_TYPE_META['ANALYSE'];
  }

  private getActeType(rx: any): string {
    return rx.acteType || 'ANALYSE';
  }

  updateStatus(rx: PrescriptionResponse & { expanded?: boolean }, status: PrescriptionStatus, event: Event): void {
    event.stopPropagation();
    this.prescriptionService.updateStatus(rx.prescriptionID, status).subscribe({
      next: (updated) => {
        const idx = this.prescriptions.findIndex(p => p.prescriptionID === rx.prescriptionID);
        if (idx !== -1) {
          this.prescriptions[idx] = { ...updated, expanded: true };
        }
      },
      error: () => { this.error = 'Erreur lors de la mise à jour du statut.'; }
    });
  }
}
