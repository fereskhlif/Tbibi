import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, AuthResponse, RegisterRequest } from '../../services/auth.service';

type UserRole = 'PATIENT' | 'DOCTEUR' | 'PHARMASIS' | 'KINE' | 'LABORATORY';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  isSignup = false;
  selectedRole = '';
  email = '';
  password = '';
  name = '';
  dateOfBirth = '';
  gender = '';
  adresse = '';
  uploadedDocument: string | null = null;

  // Pharmacy specific fields
  pharmacyName = '';
  pharmacyAddress = '';
  pharmacyPhone = '';

  isLoading = false;
  errorMessage = '';

  roles = [
    { label: 'Patient', value: 'PATIENT', icon: '🧑‍⚕️' },
    { label: 'Doctor', value: 'DOCTEUR', icon: '👨‍⚕️' },
    { label: 'Pharmacist', value: 'PHARMASIS', icon: '💊' },
    { label: 'Physiotherapist', value: 'KINE', icon: '🏃' },
    { label: 'Laboratory', value: 'LABORATORY', icon: '🔬' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isSignup = this.route.snapshot.data['signupMode'] ?? false;
  }

  toggleMode(): void {
    this.isSignup = !this.isSignup;
    this.errorMessage = '';
    this.resetForm();
  }

  selectRole(role: string): void {
    this.selectedRole = role;
    this.uploadedDocument = null;
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

  handleDocumentUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadedDocument = file.name;
  }

  handleSubmit(): void {
    this.errorMessage = '';

    if (this.isSignup) {
      if (!this.validateSignup()) return;

      this.isLoading = true;

      const registerData: RegisterRequest = {
        name: this.name,
        email: this.email,
        password: this.password,
        roleName: this.selectedRole,
        medicalLicense: this.isProfessionalRole() && this.uploadedDocument
          ? this.uploadedDocument
          : undefined,
        dateOfBirth: this.dateOfBirth || undefined,
        gender: this.gender || undefined,
        adresse: this.adresse || undefined,
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Registration successful! Please log in.');
          this.isSignup = false;
          this.resetForm();
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.handleRegistrationError(error);
        }
      });

    } else {
      // Login mode
      if (!this.email || !this.password) {
        this.errorMessage = 'Email and password are required.';
        return;
      }

      this.isLoading = true;

      this.authService.login({ email: this.email, password: this.password })
        .subscribe({
          next: (response: AuthResponse) => this.handleSuccessfulLogin(response),
          error: (error: HttpErrorResponse) => this.handleLoginError(error)
        });
    }
  }

  private validateSignup(): boolean {
    if (!this.selectedRole) {
      this.errorMessage = 'Please select a role.';
      return false;
    }
    if (!this.name?.trim()) {
      this.errorMessage = 'Full name is required.';
      return false;
    }
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      return false;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return false;
    }

    if (this.selectedRole === 'PATIENT') {
      if (!this.dateOfBirth) {
        this.errorMessage = 'Date of birth is required for patients.';
        return false;
      }
      if (!this.gender) {
        this.errorMessage = 'Gender is required.';
        return false;
      }
      if (!this.adresse?.trim()) {
        this.errorMessage = 'Address is required.';
        return false;
      }
    }

    return true;
  }

  private handleSuccessfulLogin(response: AuthResponse): void {
    this.isLoading = false;

    localStorage.setItem('TokenUserConnect', response.token);
    localStorage.setItem('EmailUserConnect', response.email);
    localStorage.setItem('RoleUserConnect', response.role);

    const routes: Record<string, string> = {
      'PATIENT': '/patient',
      'DOCTEUR': '/doctor',
      'KINE': '/physio',
      'PHARMASIS': '/pharmacist',
      'LABORATORY': '/laboratory',
      'ADMIN': '/admin'
    };

    const roleKey = (response.role || '').toUpperCase().trim();
    const destination = routes[roleKey] || '/';

    console.log(`Login successful - Role: ${roleKey} → Redirecting to: ${destination}`);
    this.router.navigateByUrl(destination);
  }

  private handleLoginError(error: HttpErrorResponse): void {
    this.isLoading = false;
    if (error.status === 401) {
      this.errorMessage = 'Invalid email or password.';
    } else {
      this.errorMessage = error.error?.message || 'Login failed. Please try again.';
    }
  }

  private handleRegistrationError(error: HttpErrorResponse): void {
    if (error.status === 409) {
      const wantsToLogin = confirm(
        `The email "${this.email}" is already registered.\n\nWould you like to login instead?`
      );
      if (wantsToLogin) this.isSignup = false;
    } else {
      this.errorMessage = typeof error.error === 'string'
        ? error.error
        : error.error?.message || 'Registration failed.';
    }
  }

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.password = '';
    this.dateOfBirth = '';
    this.gender = '';
    this.adresse = '';
    this.selectedRole = '';
    this.uploadedDocument = null;
    this.pharmacyName = '';
    this.pharmacyAddress = '';
    this.pharmacyPhone = '';
    this.errorMessage = '';
  }
}
