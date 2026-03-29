import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService, UserProfileDTO } from '../../../../services/user.service';

@Component({
  selector: 'app-patient-profile',
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Profil Patient</h1>

      <div *ngIf="loading" class="text-center py-4">
        <p class="text-gray-500">Chargement...</p>
      </div>

      <div *ngIf="!loading && userProfile" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Profile Card -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">

          <!-- Avatar -->
          <div class="relative w-24 h-24 mx-auto mb-4">
            <img
              *ngIf="profileImageUrl"
              [src]="profileImageUrl"
              alt="Profile"
              class="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
            />
            <div
              *ngIf="!profileImageUrl"
              class="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500"
            >
              <span class="text-4xl">👤</span>
            </div>

            <!-- Spinner upload -->
            <div
              *ngIf="uploadingPic"
              class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-full"
            >
              <span class="text-blue-600 text-xs font-semibold">...</span>
            </div>
          </div>

          <!-- Bouton Changer photo via label -->
          <label
            class="mt-2 inline-flex items-center justify-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            [class.opacity-50]="uploadingPic"
            [class.cursor-not-allowed]="uploadingPic"
          >
            {{ uploadingPic ? 'Envoi...' : 'Changer la photo' }}
            <input
              type="file"
              accept="image/*"
              class="hidden"
              style="display: none;"
              (change)="onFileSelected($event)"
              [disabled]="uploadingPic"
            />
          </label>

          <h2 class="text-xl font-bold text-gray-900 mt-4">{{ userProfile?.name || 'Inconnu' }}</h2>
          <p class="text-gray-500 mt-1 uppercase text-sm font-semibold tracking-wide">{{ userProfile?.roleName }}</p>
        </div>

        <!-- Personal Info -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations Personnelles</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let field of personalInfo">
              <label class="block text-sm text-gray-500 mb-1">{{ field.label }}</label>
              <input
                [type]="field.type || 'text'"
                [value]="field.value"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
                readonly
              />
            </div>
          </div>
        </div>

        <!-- Medical Info -->
        <div class="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations Médicales</h3>
          <p class="text-sm text-gray-500">Veuillez consulter la section "Dossier Médical" pour vos dossiers médicaux détaillés.</p>
        </div>

        <!-- Change Password -->
        <div class="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-gray-500 mb-1">Ancien mot de passe</label>
              <input type="password" [(ngModel)]="passwords.oldPassword" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" placeholder="**********" />
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">Nouveau mot de passe</label>
              <input type="password" [(ngModel)]="passwords.newPassword" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" placeholder="**********" />
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">Confirmer mot de passe</label>
              <input type="password" [(ngModel)]="passwords.confirmPassword" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" placeholder="**********" />
            </div>
          </div>
          <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span *ngIf="pwMessage" [class]="pwSuccess ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">{{pwMessage}}</span>
            <span *ngIf="!pwMessage"></span>
            <button (click)="changePassword()" [disabled]="changingPw" class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {{ changingPw ? 'Mise à jour...' : 'Mettre à jour' }}
            </button>
          </div>
        </div>

      </div>

      <!-- Error state -->
      <div *ngIf="!loading && !userProfile" class="text-center py-8">
        <p class="text-red-500">Impossible de charger le profil. Veuillez réessayer.</p>
        <button
          type="button"
          (click)="loadProfile()"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {

  // ✅ ViewChild pour accéder directement à l'input fichier
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly API_BASE = 'http://localhost:8088';

  userProfile: UserProfileDTO | null = null;
  loading = true;
  profileImageUrl: string | null = null;
  uploadingPic = false;
  personalInfo: any[] = [];

  passwords = { oldPassword: '', newPassword: '', confirmPassword: '' };
  changingPw = false;
  pwMessage = '';
  pwSuccess = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  // ✅ Méthode appelée par le bouton — ouvre l'explorateur de fichiers
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  loadProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.userProfile = data;

        this.profileImageUrl = data.profilePicture
          ? `${this.API_BASE}/${data.profilePicture}`
          : null;

        this.personalInfo = [
          { label: 'Full Name', value: data.name || 'N/A' },
          { label: 'Email', value: data.email || 'N/A', type: 'email' },
          { label: 'Date of Birth', value: data.dateOfBirth || 'N/A', type: 'date' },
          { label: 'Gender', value: data.gender || 'N/A' },
          { label: 'Address', value: data.adresse || 'N/A' }
        ];

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil', err);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.uploadingPic = true;
    this.userService.uploadProfilePicture(file).subscribe({
      next: (data) => {
        this.userProfile = data;
        this.profileImageUrl = `${this.API_BASE}/${data.profilePicture}`;
        this.uploadingPic = false;
        alert('Photo de profil mise à jour avec succès.');
      },
      error: (err) => {
        console.error('Erreur upload', err);
        this.uploadingPic = false;
        alert('Échec de la mise à jour de la photo de profil.');
      }
    });
  }

  changePassword(): void {
    if (!this.passwords.oldPassword || !this.passwords.newPassword || !this.passwords.confirmPassword) {
      this.pwMessage = "Veuillez remplir tous les champs.";
      this.pwSuccess = false;
      return;
    }
    if (this.passwords.newPassword !== this.passwords.confirmPassword) {
      this.pwMessage = "Les nouveaux mots de passe ne correspondent pas.";
      this.pwSuccess = false;
      return;
    }

    this.changingPw = true;
    this.pwMessage = '';

    this.userService.changePassword(this.passwords.oldPassword, this.passwords.newPassword).subscribe({
      next: () => {
        this.changingPw = false;
        this.pwSuccess = true;
        this.pwMessage = 'Mot de passe mis à jour avec succès.';
        this.passwords = { oldPassword: '', newPassword: '', confirmPassword: '' };
        setTimeout(() => this.pwMessage = '', 5000);
      },
      error: (err) => {
        console.error(err);
        this.changingPw = false;
        this.pwSuccess = false;
        if (err.status === 400 && err.error) {
          this.pwMessage = err.error;
        } else {
          this.pwMessage = 'Erreur lors du changement de mot de passe.';
        }
      }
    });
  }
}