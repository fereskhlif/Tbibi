import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type UserRole = 'ROLE_PATIENT' | 'ROLE_DOCTOR' | 'ROLE_PHARMACIST' | 'ROLE_PHYSIOTHERAPIST' | 'ROLE_LABORATORY';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  isSignup = false;
  selectedRole = '';
  email = '';
  password = '';
  uploadedDocument: string | null = null;
  isLoading = false;
  errorMessage = '';

  roles = [
    { label: 'Patient',         value: 'ROLE_PATIENT',         icon: '🧑‍⚕️' },
    { label: 'Doctor',          value: 'ROLE_DOCTOR',          icon: '👨‍⚕️' },
    { label: 'Pharmacist',      value: 'ROLE_PHARMACIST',      icon: '💊' },
    { label: 'Physiotherapist', value: 'ROLE_PHYSIOTHERAPIST', icon: '🏃' },
    { label: 'Laboratory',      value: 'ROLE_LABORATORY',      icon: '🔬' },
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
    return ['ROLE_DOCTOR', 'ROLE_PHARMACIST', 'ROLE_PHYSIOTHERAPIST', 'ROLE_LABORATORY'].includes(this.selectedRole);
  }

  getDocumentLabel(): string {
    const labels: Record<string, string> = {
      ROLE_DOCTOR: 'Medical License',
      ROLE_PHARMACIST: 'Pharmacy License',
      ROLE_PHYSIOTHERAPIST: 'Physiotherapy Certificate',
      ROLE_LABORATORY: 'Laboratory Certificate',
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
      if (!this.email || !this.password) {
        this.errorMessage = 'Email and password are required.';
        return;
      }
      if (this.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters.';
        return;
      }

      this.isLoading = true;
      this.authService.register({
        email: this.email,
        password: this.password,
        role: this.selectedRole as UserRole
      }).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Registration successful! Please log in.');
          this.isSignup = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message ?? 'An error occurred during registration.';
          console.error(error);
        }
      });

    } else {
      if (!this.email || !this.password) {
        this.errorMessage = 'Email and password are required.';
        return;
      }

      this.isLoading = true;
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (response) => {
          this.isLoading = false;
          localStorage.setItem('EmailUserConnect', JSON.stringify(response.email));
          localStorage.setItem('RoleUserConnect', JSON.stringify(response.role));
          localStorage.setItem('TokenUserConnect', JSON.stringify(response.token));

          const routes: Record<string, string> = {
            ROLE_PATIENT: '/patient',
            ROLE_DOCTOR: '/doctor',
            ROLE_PHYSIOTHERAPIST: '/physio',
            ROLE_PHARMACIST: '/pharmacist',
            ROLE_LABORATORY: '/laboratory',
          };
          this.router.navigateByUrl(routes[response.role] ?? '/');
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message ?? 'Invalid email or password.';
          console.error(error);
        }
      });
    }
  }
}