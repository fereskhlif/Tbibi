import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-activate-account',
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">

        <!-- Loading State -->
        <div *ngIf="loading" class="animate-pulse">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">
            Activation en cours...
          </h2>
          <p class="text-gray-500">
            Veuillez patienter pendant la vérification.
          </p>
        </div>

        <!-- Success State -->
        <div *ngIf="!loading && success">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✅
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">
            Compte activé !
          </h2>
          <p class="text-gray-500 mb-6">
            Votre compte a été vérifié avec succès. Vous pouvez maintenant vous connecter.
          </p>
          <button
            (click)="router.navigate(['/login'])"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">
            Se connecter
          </button>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && !success">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ❌
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">
            Activation échouée
          </h2>
          <p class="text-gray-500 mb-6">{{ errorMessage }}</p>
          <button
            (click)="router.navigate(['/login'])"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition-colors mb-3">
            Retour à l'accueil
          </button>
          <!-- Retry button -->
          <button
            (click)="ngOnInit()"
            class="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2.5 rounded-lg transition-colors">
            🔄 Réessayer
          </button>
        </div>

      </div>
    </div>
  `
})
export class ActivateAccountComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = '';

  // ✅ make router public so template can access it
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.success = false;
    this.errorMessage = '';

    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (!token) {
        this.loading = false;
        this.success = false;
        this.errorMessage = 'Aucun token d\'activation trouvé dans l\'URL.';
        return;
      }

      this.activate(token);
    });
  }

  private activate(token: string) {
    // ✅ FIXED: removed the backslash before ${token}
    this.http.get(
      `http://localhost:8088/auth/activate-account?token=${token}`,
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;

        // ✅ Auto-redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('Activation error:', err);
        this.loading = false;
        this.success = false;
        this.errorMessage = this.parseError(err);
      }
    });
  }

  // ✅ Clean error parsing method
  private parseError(err: any): string {
    if (!err.error) {
      return 'Token invalide, manquant ou expiré. Veuillez vous réinscrire.';
    }
    if (typeof err.error === 'string') return err.error;
    if (err.error.message) return err.error.message;
    if (err.error.error) return err.error.error;
    return 'Une erreur est survenue. Veuillez réessayer.';
  }
}