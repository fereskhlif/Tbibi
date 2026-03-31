import { Component, OnInit } from '@angular/core';
import { TreatmentPlanService } from '../../services/treatment-plan.service';
import { TreatmentPlan, TreatmentPlanRequest } from '../../models/treatment-plan.model';
import { HttpClient } from '@angular/common/http';

interface Patient {
  userId: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-treatment-plan',
  templateUrl: './treatment-plan.component.html',
  styleUrls: ['./treatment-plan.component.css']
})
export class TreatmentPlanComponent implements OnInit {
  plans: TreatmentPlan[] = [];
  filteredPlans: TreatmentPlan[] = [];
  patients: Patient[] = [];
  currentPhysioId: number = 9;
  
  filterStatus: string = 'all';
  searchTerm: string = '';
  
  showCreateModal: boolean = false;
  showEditModal: boolean = false;
  showDetailModal: boolean = false;
  selectedPlan: TreatmentPlan | null = null;
  
  newPlan: TreatmentPlanRequest = this.getEmptyPlan();
  editPlan: TreatmentPlanRequest = this.getEmptyPlan();

  private apiUrl = 'http://localhost:8088/api';

  constructor(
    private treatmentPlanService: TreatmentPlanService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadPlans();
    this.loadPatients();
  }

  loadPlans(): void {
    this.treatmentPlanService.getByPhysiotherapist(this.currentPhysioId)
      .subscribe({
        next: (data) => {
          this.plans = data;
          this.applyFilters();
        },
        error: (err) => console.error('Error loading plans:', err)
      });
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

  applyFilters(): void {
    this.filteredPlans = this.plans.filter(plan => {
      const matchesStatus = this.filterStatus === 'all' || plan.status === this.filterStatus;
      const matchesSearch = !this.searchTerm || 
        plan.planName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        plan.patientName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        plan.diagnosis?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  openCreateModal(): void {
    this.newPlan = this.getEmptyPlan();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openEditModal(plan: TreatmentPlan): void {
    this.selectedPlan = plan;
    this.editPlan = {
      patientId: plan.patientId,
      physiotherapistId: plan.physiotherapistId,
      planName: plan.planName,
      diagnosis: plan.diagnosis,
      therapeuticGoals: plan.therapeuticGoals,
      exercises: plan.exercises,
      durationWeeks: plan.durationWeeks,
      startDate: plan.startDate,
      status: plan.status,
      notes: plan.notes || ''
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedPlan = null;
  }

  openDetailModal(plan: TreatmentPlan): void {
    this.selectedPlan = plan;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedPlan = null;
  }

  createPlan(): void {
    if (!this.validatePlan(this.newPlan)) return;
    
    this.treatmentPlanService.create(this.newPlan).subscribe({
      next: () => {
        this.loadPlans();
        this.closeCreateModal();
        alert('Plan de traitement créé avec succès!');
      },
      error: (err) => {
        console.error('Error creating plan:', err);
        alert('Erreur lors de la création du plan');
      }
    });
  }

  updatePlan(): void {
    if (!this.selectedPlan || !this.validatePlan(this.editPlan)) return;
    
    this.treatmentPlanService.update(this.selectedPlan.planId!, this.editPlan).subscribe({
      next: () => {
        this.loadPlans();
        this.closeEditModal();
        alert('Plan de traitement mis à jour avec succès!');
      },
      error: (err) => {
        console.error('Error updating plan:', err);
        alert('Erreur lors de la mise à jour du plan');
      }
    });
  }

  updateStatus(planId: number, status: string): void {
    if (!confirm(`Voulez-vous vraiment changer le statut à "${status}"?`)) return;
    
    this.treatmentPlanService.updateStatus(planId, status).subscribe({
      next: () => {
        this.loadPlans();
        alert('Statut mis à jour avec succès!');
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  deletePlan(planId: number): void {
    if (!confirm('Voulez-vous vraiment supprimer ce plan de traitement?')) return;
    
    this.treatmentPlanService.delete(planId).subscribe({
      next: () => {
        this.loadPlans();
        alert('Plan de traitement supprimé avec succès!');
      },
      error: (err) => {
        console.error('Error deleting plan:', err);
        alert('Erreur lors de la suppression du plan');
      }
    });
  }

  validatePlan(plan: TreatmentPlanRequest): boolean {
    if (!plan.patientId || !plan.planName || !plan.diagnosis || !plan.therapeuticGoals || 
        !plan.exercises || !plan.durationWeeks || !plan.startDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    return true;
  }

  getEmptyPlan(): TreatmentPlanRequest {
    return {
      patientId: 0,
      physiotherapistId: this.currentPhysioId,
      planName: '',
      diagnosis: '',
      therapeuticGoals: '',
      exercises: '',
      durationWeeks: 8,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      notes: ''
    };
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Active': 'status-active',
      'Completed': 'status-completed',
      'Suspended': 'status-suspended'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusBadgeClass(status: string): string {
    const badgeMap: { [key: string]: string } = {
      'Active': 'bg-green-100 text-green-700',
      'Completed': 'bg-blue-100 text-blue-700',
      'Suspended': 'bg-orange-100 text-orange-700'
    };
    return badgeMap[status] || 'bg-gray-100 text-gray-700';
  }
}
