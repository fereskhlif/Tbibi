import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService, AuthResponse, RegisterRequest } from '../../services/auth.service'; // Ajoutez AuthResponse ici

// Mettez à jour le type UserRole pour correspondre aux nouvelles valeurs
type UserRole = 'PATIENT' | 'DOCTEUR' | 'PHARMASIS' | 'KINE' | 'LABORATORY';

//type UserRole = 'ROLE_PATIENT' | 'ROLE_DOCTOR' | 'ROLE_PHARMACIST' | 'ROLE_PHYSIOTHERAPIST' | 'ROLE_LABORATORY';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  isSignup = false;
  selectedRole = '';
  email = '';
  password = '';
  name = '';
  dateOfBirth = '';
  gender = '';
  adresse = '';
  uploadedDocument: string | null = null;
  isLoading = false;
  errorMessage = '';

  roles = [
    { label: 'Patient', value: 'PATIENT', icon: '🧑‍⚕️' },  // Removed ROLE_ prefix
    { label: 'Doctor', value: 'DOCTEUR', icon: '👨‍⚕️' },  // Changed to DOCTEUR
    { label: 'Pharmacist', value: 'PHARMASIS', icon: '💊' },    // Changed to PHARMASIS
    { label: 'Physiotherapist', value: 'KINE', icon: '🏃' },    // Changed to KINE
    { label: 'Laboratory', value: 'LABORATORY', icon: '🔬' },    // LABORATORY matches
  ];


  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isSignup = this.route.snapshot.data['signupMode'] ?? false;
  }

  toggleMode(): void {
    this.isSignup = !this.isSignup;
    this.errorMessage = '';
  }

  selectRole(role: string): void {
    this.selectedRole = role;
  }

  isProfessionalRole(): boolean {
    return ['DOCTEUR', 'PHARMASIS', 'KINE', 'LABORATORY'].includes(this.selectedRole);
  }

  getDocumentLabel(): string {
    const labels: Record<string, string> = {
      DOCTEUR: 'Medical License',
      PHARMASIS: 'Pharmacy License',
      KINE: 'Physiotherapy Certificate',
      LABORATORY: 'Laboratory Certificate',
    };
    return labels[this.selectedRole] ?? 'Document';
  }

  getDocumentPlaceholder(): string {
    return `Upload your ${this.getDocumentLabel()} (PDF, JPG, PNG)`;
  }

  handleDocumentUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadedDocument = file.name;
  }

  handleSubmit(): void {
    this.errorMessage = '';

    if (this.isSignup) {
      // Validations
      if (!this.selectedRole) {
        this.errorMessage = 'Please select a role.';
        return;
      }
      if (!this.name || !this.name.trim()) {
        this.errorMessage = 'Full name is required.';
        return;
      }
      if (!this.email || !this.password) {
        this.errorMessage = 'Email and password are required.';
        return;
      }
      if (this.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters.';
        return;
      }

      this.isLoading = true;

      const registerData: RegisterRequest = {
        name: this.name,  // Utilize the name variable
        email: this.email,
        password: this.password,
        roleName: this.selectedRole as string,  // ✅ Utilisez roleName, pas role
        medicalLicense: this.isProfessionalRole() && this.uploadedDocument ? this.uploadedDocument : undefined,
        ...(this.selectedRole === 'PATIENT' && {
          dateOfBirth: this.dateOfBirth,
          gender: this.gender,
          adresse: this.adresse
        })
      };

      if (this.isProfessionalRole() && this.uploadedDocument) {
        registerData.medicalLicense = this.uploadedDocument;
      }

      console.log('Sending registration data:', registerData);

      this.authService.register(registerData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('Registration successful:', response);

          alert('Registration successful! Please log in.');

          // Reset form and switch to login mode
          this.isSignup = false;
          this.selectedRole = '';
          this.password = '';
          this.name = '';
          this.uploadedDocument = null;
          // Email is preserved for convenience
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Registration error:', error);

          if (error.status === 409) {
            // Email already exists - offer to login
            const wantsToLogin = confirm(
              `The email "${this.email}" is already registered.\n\nWould you like to login instead?`
            );

            if (wantsToLogin) {
              // Switch to login mode with email preserved
              this.isSignup = false;
              this.errorMessage = '';
            } else {
              // Clear email for new registration
              this.email = '';
              this.errorMessage = 'Please use a different email address.';
            }
          } else {
            this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          }
        }
      });

    } else {
      // LOGIN MODE
      if (!this.email || !this.password) {
        this.errorMessage = 'Email and password are required.';
        return;
      }

      this.isLoading = true;

      this.authService.login({
        email: this.email,
        password: this.password
      }).subscribe({
        next: (response: AuthResponse) => {
          this.isLoading = false;
          console.log('✅ Login successful:', response);

          // Décoder le token pour vérifier l'email
          try {
            const parts = response.token.split('.');
            const payload = JSON.parse(atob(parts[1]));
            console.log('📦 Token payload:', payload);

            if (!payload.sub || !payload.sub.includes('@')) {
              console.error('❌ Email invalide dans le token!');
            }
          } catch (e) {
            console.error('❌ Erreur décodage token');
          }

          // Stocker
          localStorage.setItem('TokenUserConnect', response.token);
          localStorage.setItem('EmailUserConnect', response.email);
          localStorage.setItem('RoleUserConnect', response.role);

          // Redirection
          const routes: Record<string, string> = {
            'PATIENT': '/patient',
            'DOCTEUR': '/doctor',
            'KINE': '/physio',
            'PHARMASIS': '/pharmacist',
            'LABORATORY': '/laboratory'
          };

          const destination = routes[response.role] || '/';
          this.router.navigateByUrl(destination);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Login error:', error);

          if (error.status === 401) {
            this.errorMessage = 'Invalid email or password.';
          } else {
            this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          }
        }
      });
    }
  }

  // Utility method to check token expiration
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  }
  // Méthode pour réinitialiser le formulaire
  resetForm(): void {
    this.email = '';
    this.password = '';
    this.name = '';
    this.dateOfBirth = '';
    this.gender = '';
    this.adresse = '';
    this.selectedRole = '';
    this.uploadedDocument = null;
    this.errorMessage = '';
  }
}