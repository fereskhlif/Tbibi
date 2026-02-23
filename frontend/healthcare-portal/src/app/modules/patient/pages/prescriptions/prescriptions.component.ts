import { Component, OnInit } from '@angular/core';
import { PrescriptionRequest, PrescriptionResponse, PrescriptionService } from '../../../../services/prescription-service.service';

@Component({
  selector: 'app-prescriptions',
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p class="text-gray-600">Manage your medications and refills</p>
        </div>
        <button (click)="openAddModal()" class="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
          + New Request
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-10 text-gray-500">Chargement...</div>

      <!-- Error -->
      <div *ngIf="error" class="text-center py-10 text-red-500">{{error}}</div>

      <!-- Liste -->
      <div class="space-y-4" *ngIf="!loading && !error">
        <div *ngFor="let rx of prescriptions"
          class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">

          <div class="p-6 flex items-start gap-4 cursor-pointer" (click)="rx.expanded = !rx.expanded">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-50">
              <lucide-icon name="pill" class="w-6 h-6 text-gray-700"></lucide-icon>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-bold text-gray-900 text-lg">Prescription #{{rx.prescriptionID}}</h3>
                <span class="px-2.5 py-0.5 text-xs rounded-full font-medium bg-green-100 text-green-700">Active</span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{rx.note}}</p>
              <p class="text-xs text-gray-500">{{rx.date | date: 'dd/MM/yyyy'}}</p>
              <div class="mt-2" *ngIf="rx.medicines && rx.medicines.length > 0">
                <span *ngFor="let m of rx.medicines"
                  class="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mr-1">
                  {{m.medicineName}} ({{m.quantity}})
                </span>
              </div>
            </div>
            <div class="text-gray-400 group-hover:text-blue-600 transition-colors">
              <lucide-icon name="chevron-down"
                [class]="'w-5 h-5 transform transition-transform ' + (rx.expanded ? 'rotate-180' : '')">
              </lucide-icon>
            </div>
          </div>

          <!-- Expanded Actions -->
          <div *ngIf="rx.expanded"
            class="border-t border-gray-100 bg-gray-50 p-4 flex flex-wrap gap-3 animate-slide-down">
            <button (click)="openEditModal(rx)"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Modifier
            </button>
            <button (click)="deletePrescription(rx.prescriptionID)"
              class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
              Supprimer
            </button>
          </div>
        </div>

        <div *ngIf="prescriptions.length === 0" class="text-center py-10 text-gray-400">
          Aucune prescription trouvée.
        </div>
      </div>

      <!-- Modal Add/Edit -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <h2 class="text-lg font-bold mb-4">{{editMode ? 'Modifier' : 'Nouvelle'}} Prescription</h2>
          <div class="space-y-3">
            <div>
              <label class="text-sm text-gray-600">Note</label>
              <input [(ngModel)]="form.note"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm"
                placeholder="Note..." />
            </div>
            <div>
              <label class="text-sm text-gray-600">Date</label>
              <input type="datetime-local" [(ngModel)]="form.date"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm" />
            </div>
          </div>
          <div class="flex gap-3 mt-5 justify-end">
            <button (click)="showModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              Annuler
            </button>
            <button (click)="save()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rotate-180 { transform: rotate(180deg); }
    @keyframes slide-down { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide-down { animation: slide-down 0.2s ease-out; }
  `]
})
export class PrescriptionsComponent implements OnInit {

  prescriptions: PrescriptionResponse[] = [];
  loading = false;
  error = '';
  showModal = false;
  editMode = false;
  selectedId: number | null = null;

  form: PrescriptionRequest = {
    note: '',
    date: ''
  };

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';
    this.prescriptionService.getAll().subscribe({
      next: (data: PrescriptionResponse[]) => {
        this.prescriptions = data.map(rx => ({ ...rx, expanded: false }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des prescriptions.';
        this.loading = false;
      }
    });
  }

  openAddModal(): void {
    this.editMode = false;
    this.selectedId = null;
    this.form = { note: '', date: '' };
    this.showModal = true;
  }

  openEditModal(rx: PrescriptionResponse): void {
    this.editMode = true;
    this.selectedId = rx.prescriptionID;
    this.form = { note: rx.note, date: rx.date };
    this.showModal = true;
  }

  save(): void {
    if (this.editMode && this.selectedId !== null) {
      this.prescriptionService.update(this.selectedId, this.form).subscribe({
        next: () => {
          this.showModal = false;
          this.loadAll();
        },
        error: () => {
          this.error = 'Erreur lors de la modification.';
        }
      });
    } else {
      this.prescriptionService.add(this.form).subscribe({
        next: () => {
          this.showModal = false;
          this.loadAll();
        },
        error: () => {
          this.error = "Erreur lors de l'ajout.";
        }
      });
    }
  }

  deletePrescription(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette prescription ?')) {
      this.prescriptionService.delete(id).subscribe({
        next: () => {
          this.loadAll();
        },
        error: () => {
          this.error = 'Erreur lors de la suppression.';
        }
      });
    }
  }
}