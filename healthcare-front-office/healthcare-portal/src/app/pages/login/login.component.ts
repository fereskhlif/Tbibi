import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, AuthResponse, RegisterRequest } from '../../services/auth.service';
import { COUNTRIES, Country } from '../../shared/utils/countries';

type UserRole = 'PATIENT' | 'DOCTEUR' | 'PHARMASIS' | 'KINE' | 'LABORATORY';

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
  specialty = '';
  pharmacyName = '';
  pharmacyAddress = '';
  
  countries = COUNTRIES;
  selectedCountry = this.countries.find(c => c.name === 'Tunisia') || this.countries[0];
  phoneNumber = '';
  isCountryDropdownOpen = false;
  searchCountryQuery = '';

  get filteredCountries(): Country[] {
    if (!this.searchCountryQuery) {
      return this.countries;
    }
    const query = this.searchCountryQuery.toLowerCase();
    return this.countries.filter(c => 
      c.name.toLowerCase().startsWith(query) || 
      c.dialCode.includes(query)
    );
  }

  uploadedDocument: string | null = null;
  uploadedDocumentBase64: string | null = null;
  uploadedProfilePhoto: string | null = null;
  uploadedProfilePhotoBase64: string | null = null;
  isLoading = false;
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};

  specialties = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'General Practice',
    'Gynecology',
    'Hematology',
    'Neurology',
    'Nephrology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Otolaryngology (ENT)',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Rheumatology',
    'Surgery',
    'Urology'
  ];

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
  ) {
    this.isSignup = this.route.snapshot.data['signupMode'] ?? false;
  }

  toggleMode(): void {
    this.isSignup = !this.isSignup;
    this.errorMessage = '';
    this.fieldErrors = {};
    this.isCountryDropdownOpen = false;
  }

  selectRole(role: string): void {
    this.selectedRole = role;
    this.fieldErrors = {};
  }

  selectCountry(country: Country): void {
    this.selectedCountry = country;
    this.isCountryDropdownOpen = false;
  }

  toggleCountryDropdown(): void {
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
    if (this.isCountryDropdownOpen) {
      this.searchCountryQuery = '';
    }
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
    if (file) {
      this.uploadedDocument = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedDocumentBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  handleProfilePhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadedProfilePhoto = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedProfilePhotoBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  handleSubmit(): void {
    this.errorMessage = '';
    this.fieldErrors = {};

    if (this.isSignup) {
      if (!this.selectedRole) {
        this.errorMessage = 'Please select a role.';
        return;
      }

      let hasFrontendErrors = false;

      if (!this.name || !this.name.trim()) {
        this.fieldErrors['name'] = 'Invalid name';
        hasFrontendErrors = true;
      }
      if (!this.email || !this.email.trim()) {
        this.fieldErrors['email'] = 'Invalid email';
        hasFrontendErrors = true;
      }
      if (!this.password) {
        this.fieldErrors['password'] = 'Invalid password';
        hasFrontendErrors = true;
      } else {
        let pwdErrors = [];
        if (this.password.length < 8) pwdErrors.push('at least 8 characters');
        if (!/[A-Z]/.test(this.password)) pwdErrors.push('one uppercase');
        if (!/[a-z]/.test(this.password)) pwdErrors.push('one lowercase');
        if (!/\d/.test(this.password)) pwdErrors.push('one number');
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password)) pwdErrors.push('one special char');

        if (pwdErrors.length > 0) {
          this.fieldErrors['password'] = 'Invalid password';
          hasFrontendErrors = true;
        }
      }

      if (!this.phoneNumber || !this.phoneNumber.trim()) {
        this.fieldErrors['phone'] = 'Invalid phone number';
        hasFrontendErrors = true;
      } else if (!/^\d+$/.test(this.phoneNumber)) {
        this.fieldErrors['phone'] = 'Invalid phone number';
        hasFrontendErrors = true;
      }

      if (this.selectedRole === 'PATIENT') {
        if (!this.dateOfBirth) {
          this.fieldErrors['dateOfBirth'] = 'Invalid date of birth';
          hasFrontendErrors = true;
        }
        if (!this.gender) {
          this.fieldErrors['gender'] = 'Invalid gender';
          hasFrontendErrors = true;
        }
        if (!this.adresse || !this.adresse.trim()) {
          this.fieldErrors['adresse'] = 'Invalid address';
          hasFrontendErrors = true;
        }
      }

      if (this.isProfessionalRole() && !this.uploadedDocumentBase64) {
        this.errorMessage = 'Vous devez obligatoirement télécharger votre diplôme ou certificat.';
        hasFrontendErrors = true;
      }

      if (this.selectedRole === 'PHARMASIS') {
        if (!this.pharmacyName || !this.pharmacyName.trim()) {
          this.fieldErrors['pharmacyName'] = 'Invalid pharmacy name';
          hasFrontendErrors = true;
        }
        if (!this.pharmacyAddress || !this.pharmacyAddress.trim()) {
          this.fieldErrors['pharmacyAddress'] = 'Invalid pharmacy address';
          hasFrontendErrors = true;
        }
      }

      if (hasFrontendErrors) {
        return;
      }

      this.isLoading = true;

      const registerData: any = {
        name: this.name,
        email: this.email,
        password: this.password,
        phone: this.selectedCountry.dialCode + this.phoneNumber,
        roleName: this.selectedRole as string,
        ...(this.selectedRole === 'PATIENT' && {
          dateOfBirth: this.dateOfBirth,
          gender: this.gender,
          adresse: this.adresse
        }),
        ...(this.selectedRole === 'DOCTEUR' && this.specialty && {
          specialty: this.specialty
        }),
        ...(this.selectedRole === 'PHARMASIS' && {
          pharmacyName: this.pharmacyName,
          pharmacyAddress: this.pharmacyAddress
        })
      };

      if (this.isProfessionalRole() && this.uploadedDocumentBase64) {
        registerData.documentBase64 = this.uploadedDocumentBase64;
        registerData.documentName = this.uploadedDocument;
      }

      if (this.uploadedProfilePhotoBase64) {
        registerData.profilePictureBase64 = this.uploadedProfilePhotoBase64;
        registerData.profilePictureName = this.uploadedProfilePhoto;
      }

      console.log('Sending registration data:', registerData);

      this.authService.register(registerData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('Registration successful:', response);
          alert('Registration successful! Please log in.');
          this.isSignup = false;
          this.selectedRole = '';
          this.password = '';
          this.name = '';
          this.uploadedDocument = null;
          this.fieldErrors = {};
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.fieldErrors = {};
          console.error('Registration error:', error);

          if (error.status === 409) {
            const wantsToLogin = confirm(
              `The email "${this.email}" is already registered.\n\nWould you like to login instead?`
            );
            if (wantsToLogin) {
              this.isSignup = false;
              this.errorMessage = '';
            } else {
              this.email = '';
              this.errorMessage = 'Please use a different email address.';
            }
          } else if (error.status === 400) {
            let parsedError = error.error;
            if (typeof error.error === 'string') {
              try {
                parsedError = JSON.parse(error.error);
              } catch (e) {
                // Not JSON string, keep as is
              }
            }

            if (parsedError && typeof parsedError === 'object') {
              // field-level validation errors from backend e.g. {"email": "...", "name": "..."}
              this.fieldErrors = parsedError;
            } else {
              this.errorMessage = typeof error.error === 'string' ? error.error : 'Registration failed. Please try again.';
            }
          } else {
            const errorMsg = typeof error.error === 'string' ? error.error : error.error?.message;
            this.errorMessage = errorMsg || 'Registration failed. Please try again.';
          }
        }
      });

    } else {
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

          localStorage.setItem('TokenUserConnect', response.token);
          localStorage.setItem('EmailUserConnect', response.email);
          localStorage.setItem('RoleUserConnect', response.role);
          localStorage.setItem('userId', response.userId ? response.userId.toString() : '0');

          if (response.name) {
            localStorage.setItem('UserName', response.name);
          }
          if (response.pharmacyId) {
            localStorage.setItem('pharmacyId', response.pharmacyId.toString());
          }

          const routes: Record<string, string> = {
            'PATIENT': '/patient',
            'ROLE_PATIENT': '/patient',
            'DOCTEUR': '/doctor',
            'DOCTOR': '/doctor',
            'ROLE_DOCTEUR': '/doctor',
            'ROLE_DOCTOR': '/doctor',
            'KINE': '/physio',
            'PHYSIOTHERAPIST': '/physio',
            'ROLE_KINE': '/physio',
            'PHARMASIS': '/pharmacist',
            'PHARMACIST': '/pharmacist',
            'ROLE_PHARMASIS': '/pharmacist',
            'LABORATORY': '/laboratory',
            'ROLE_LABORATORY': '/laboratory',
            'ADMIN': '/admin/dashboard',
            'ROLE_ADMIN': '/admin/dashboard'
          };

          const roleKey = response.role ? response.role.toUpperCase().trim() : '';
          const destination = routes[roleKey] || '/';
          console.log(`Routing role '${roleKey}' to -> ${destination}`);
          this.router.navigateByUrl(destination);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Login error:', error);

          if (error.status === 401) {
            const errorMsg = typeof error.error === 'string' ? error.error : error.error?.message;
            this.errorMessage = errorMsg || 'Invalid email or password.';
          } else {
            this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          }
        }
      });
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  }

  resetForm(): void {
    this.email = '';
    this.password = '';
    this.name = '';
    this.dateOfBirth = '';
    this.gender = '';
    this.adresse = '';
    this.specialty = '';
    this.pharmacyName = '';
    this.pharmacyAddress = '';
    this.phoneNumber = '';
    this.selectedRole = '';
    this.uploadedDocument = null;
    this.uploadedDocumentBase64 = null;
    this.uploadedProfilePhoto = null;
    this.uploadedProfilePhotoBase64 = null;
    this.errorMessage = '';
    this.fieldErrors = {};
  }
}