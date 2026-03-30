import { Component, OnInit } from '@angular/core';
import { AdminService, AdminUser } from '../../../../services/admin.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-approvals',
  template: `
  <div class="min-h-screen bg-gray-50 p-6 lg:p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">Approbations en attente</h1>
      <p class="text-sm text-gray-500 mt-0.5">Validation des professionnels de santé inscrits</p>
    </div>

    <!-- Error/Loading -->
    <div *ngIf="loading" class="text-gray-500 mb-6 flex justify-center py-10 border border-dashed border-gray-300 rounded-2xl bg-white">Chargement...</div>
    <div *ngIf="error" class="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex justify-between">
      <span>⚠️ {{error}}</span>
      <button (click)="loadPending()" class="underline font-medium">Réessayer</button>
    </div>

    <!-- Cards Grid -->
    <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      
      <!-- User Card -->
      <div *ngFor="let user of pendingUsers" class="bg-white border-2 border-orange-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
            {{user.role.roleName}}
          </span>
        </div>
        
        <div class="flex items-center gap-4 mb-5">
          <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-gray-600">
            {{user.name.charAt(0).toUpperCase()}}
          </div>
          <div>
            <h3 class="font-bold text-lg text-gray-900 leading-tight">{{user.name}}</h3>
            <p class="text-sm text-gray-500">{{user.email}}</p>
          </div>
        </div>

        <div class="space-y-2 mb-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
          <div class="flex justify-between border-b border-gray-200 pb-2">
            <span class="font-medium">Date de naissance</span>
            <span>{{user.dateOfBirth || 'Non renseigné'}}</span>
          </div>
          <div class="flex justify-between pt-1">
            <span class="font-medium">Genre</span>
            <span>{{user.gender === 'Female' ? 'Féminin' : 'Masculin'}}</span>
          </div>
        </div>

        <!-- Document Verification Button -->
        <button (click)="openDiploma(user, $event)" class="w-full mb-6 flex items-center justify-center gap-3 border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-all rounded-xl p-4 cursor-pointer select-none font-medium text-blue-600">
          <span class="text-2xl">📄</span>
          <span>Diplôme / Certificat (PJ) - Ouvrir le document</span>
        </button>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button (click)="approveUser(user.userId)" class="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
            ✅ Approuver
          </button>
          <button (click)="rejectUser(user.userId)" class="px-4 bg-white text-red-600 font-bold border border-red-200 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
            Refuser
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="pendingUsers.length === 0" class="col-span-full border border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🎉</div>
        <h3 class="text-lg font-bold text-gray-900 mb-1">Aucune demande en attente</h3>
        <p class="text-gray-500">Tous les comptes professionnels ont été traités.</p>
      </div>

    </div>
  </div>
  `
})
export class AdminApprovalsComponent implements OnInit {
  pendingUsers: AdminUser[] = [];
  loading = false;
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.adminService.getPendingApprovals().subscribe({
      next: (data) => {
        this.pendingUsers = data;
        this.loading = false;
        this.error = '';
      },
      error: (err) => {
        console.error(err);
        this.error = "Erreur de connexion (Mock data injectée).";
        this.loading = false;
        
        // Mock data for UI development
        this.pendingUsers = [
          { userId: 2, name: 'Dr. Karim Mansouri', email: 'karim@clinic.tn', role: { roleName: 'DOCTOR' }, accountStatus: 'PENDING', gender: 'Male', enabled: true, dateOfBirth: '1985-06-12' },
          { userId: 5, name: 'Laboratoire Central', email: 'contact@labocentral.tn', role: { roleName: 'LABORATORY' }, accountStatus: 'PENDING', gender: 'Male', enabled: true, dateOfBirth: '2000-01-01' },
          { userId: 7, name: 'Dr. Sonia Kine', email: 'sonia.k@kine.tn', role: { roleName: 'PHYSIOTHERAPIST' }, accountStatus: 'PENDING', gender: 'Female', enabled: true, dateOfBirth: '1990-03-24' },
        ];
      }
    });
  }

  approveUser(userId: number): void {
    if (!confirm('Valider définitivement et activer ce compte professionnel ?')) return;
    this.adminService.updateUserStatus(userId, 'ACTIVE').subscribe({
      next: () => this.loadPending(),
      error: () => {
        // Optimistic UI update for mock
        this.pendingUsers = this.pendingUsers.filter(u => u.userId !== userId);
      }
    });
  }

  rejectUser(userId: number): void {
    if (!confirm('Rejeter cette demande ? Le compte ne sera pas activé.')) return;
    this.adminService.updateUserStatus(userId, 'REJECTED').subscribe({
      next: () => this.loadPending(),
      error: () => {
        // Optimistic UI update for mock
        this.pendingUsers = this.pendingUsers.filter(u => u.userId !== userId);
      }
    });
  }

  dummyClick(event: Event): void {
    event.preventDefault();
    window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
  }

  getDiplomaUrl(profilePicture: string): string {
    if (!profilePicture) return '';
    // Already a full URL
    if (profilePicture.startsWith('http')) return profilePicture;
    
    // Extract just the filename in case the DB stored it with path like "uploads/..."
    const filename = profilePicture.replace(/^.*[\\/]/, '');

    // Return the URL mapping to the proxy endpoint exposing the uploads folder
    return `${environment.baseUrl}/uploads/documents/${filename}`;
  }

  openDiploma(user: AdminUser, event: Event): void {
    if (user.profilePicture) {
      window.open(this.getDiplomaUrl(user.profilePicture), '_blank');
    } else {
      // Si pas de diplôme, ouvrir un PDF de test
      window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
    }
  }
}
