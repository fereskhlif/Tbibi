import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span class="text-3xl">🏥</span>
            </div>
            <h1 class="text-gray-900 mb-2">MediCare Portal</h1>
            <p class="text-gray-600">{{ isSignup ? 'Create your account' : 'Sign in to your account' }}</p>
          </div>

          <!-- Role Selection -->
          <div class="mb-6" *ngIf="isSignup">
            <label class="block text-sm text-gray-700 mb-2">I am a:</label>
            <div class="grid grid-cols-3 gap-2">
              <button *ngFor="let r of roles" type="button" (click)="selectRole(r.value)"
                [class]="'p-3 border-2 rounded-lg transition-all ' + (selectedRole === r.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300')">
                <div class="text-2xl mb-1">{{r.icon}}</div>
                <div class="text-xs font-medium">{{r.label}}</div>
              </button>
            </div>
          </div>

          <form (ngSubmit)="handleSubmit()" class="space-y-4">
            <div *ngIf="isSignup">
              <label class="block text-sm text-gray-700 mb-1.5">Full Name <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="fullName" name="fullName" 
                [class]="'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (showGeneralErrors && !fullName ? 'border-red-500' : 'border-gray-300')" 
                placeholder="John Doe" required />
              <p *ngIf="showGeneralErrors && !fullName" class="text-xs text-red-500 mt-1">Full Name is required</p>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1.5">Email Address <span class="text-red-500">*</span></label>
              <input type="email" [(ngModel)]="email" name="email" 
                [class]="'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (showGeneralErrors && emailError ? 'border-red-500' : 'border-gray-300')" 
                placeholder="you@example.com" required />
              <p *ngIf="showGeneralErrors && emailError" class="text-xs text-red-500 mt-1">{{emailError}}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1.5">Password <span class="text-red-500">*</span></label>
              <input type="password" [(ngModel)]="password" name="password" 
                [class]="'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (showGeneralErrors && passwordError ? 'border-red-500' : 'border-gray-300')" 
                placeholder="••••••••" required />
              <p *ngIf="showGeneralErrors && passwordError" class="text-xs text-red-500 mt-1">{{passwordError}}</p>
            </div>

            <!-- Professional Document Upload -->
            <div *ngIf="isSignup && isProfessionalRole()">
              <label class="block text-sm text-gray-700 mb-1.5">
                {{getDocumentLabel()}} <span class="text-red-500">*</span>
              </label>
              <label [class]="'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors ' + (showGeneralErrors && !uploadedDocument ? 'border-red-500 bg-red-50/30' : 'border-gray-300')">
                <div *ngIf="uploadedDocument" class="text-center">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"><span class="text-2xl">✓</span></div>
                  <p class="text-sm text-gray-900 mb-1">Document uploaded</p>
                  <p class="text-xs text-gray-500">{{uploadedDocument}}</p>
                </div>
                <div *ngIf="!uploadedDocument" class="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 mb-2 mx-auto"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p class="text-sm text-gray-600 mb-1">{{getDocumentPlaceholder()}}</p>
                  <p class="text-xs text-gray-500">PDF, JPG, or PNG (max 10MB)</p>
                </div>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="handleDocumentUpload($event)" class="hidden" />
              </label>
              <p *ngIf="showGeneralErrors && !uploadedDocument" class="text-xs text-red-500 mt-1.5">Professional certification document is required</p>
              <p *ngIf="!(showGeneralErrors && !uploadedDocument)" class="text-xs text-gray-500 mt-1.5">Required for verification as a medical professional</p>
            </div>

            <!-- Pharmacy Specific Fields -->
            <div *ngIf="isSignup && selectedRole === 'pharmacist'" class="space-y-4 pt-2">
              <h3 class="text-sm font-medium text-gray-900 border-b pb-2">Pharmacy Information</h3>
              <div>
                <label class="block text-sm text-gray-700 mb-1.5">Pharmacy Name <span class="text-red-500">*</span></label>
                <input type="text" [(ngModel)]="pharmacyName" name="pharmacyName" 
                  [class]="'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (showPharmacyErrors && !pharmacyName ? 'border-red-500' : 'border-gray-300')" 
                  placeholder="e.g. CityPharma" />
                <p *ngIf="showPharmacyErrors && !pharmacyName" class="text-xs text-red-500 mt-1">Pharmacy Name is required</p>
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-1.5">Pharmacy Address <span class="text-red-500">*</span></label>
                <input type="text" [(ngModel)]="pharmacyAddress" name="pharmacyAddress" 
                  [class]="'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (showPharmacyErrors && !pharmacyAddress ? 'border-red-500' : 'border-gray-300')" 
                  placeholder="e.g. Tunis Center, Rue de la Liberté" />
                <p *ngIf="showPharmacyErrors && !pharmacyAddress" class="text-xs text-red-500 mt-1">Pharmacy Address is required</p>
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-1.5">Pharmacy Phone Number <span class="text-red-500">*</span></label>
                <input type="tel" [(ngModel)]="pharmacyPhone" name="pharmacyPhone" 
                  [class]="'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (showPharmacyErrors && phoneError ? 'border-red-500' : 'border-gray-300')" 
                  placeholder="e.g. +216 71 234 567" />
                <p *ngIf="showPharmacyErrors && phoneError" class="text-xs text-red-500 mt-1">{{phoneError}}</p>
              </div>
            </div>

            <div *ngIf="!isSignup" class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2">
                <input type="checkbox" class="rounded" />
                <span class="text-gray-600">Remember me</span>
              </label>
              <a routerLink="/forgot-password" class="text-blue-600 hover:text-blue-700">Forgot password?</a>
            </div>

            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
              {{ isSignup ? 'Create Account' : 'Sign In' }}
            </button>
          </form>

          <div class="mt-6 text-center text-sm">
            <span class="text-gray-600">{{ isSignup ? 'Already have an account?' : "Don't have an account?" }}</span>
            <button (click)="toggleMode()" class="text-blue-600 hover:text-blue-700 ml-1">
              {{ isSignup ? 'Sign in' : 'Sign up' }}
            </button>
          </div>
        </div>
        <p class="text-center text-sm text-gray-600 mt-6">
          {{ isSignup ? 'Your information is secure and will be verified' : 'Demo: patient@, doctor@, physio@, pharmacist@, lab@example.com' }}
        </p>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  isSignup = false;
  email = '';
  password = '';
  fullName = '';
  selectedRole: string = 'patient';
  uploadedDocument: string | null = null;

  pharmacyName = '';
  pharmacyAddress = '';
  pharmacyPhone = '';
  showPharmacyErrors = false;
  showGeneralErrors = false;

  emailError = '';
  passwordError = '';
  phoneError = '';

  roles = [
    { value: 'patient', icon: '👤', label: 'Patient' },
    { value: 'doctor', icon: '👨‍⚕️', label: 'Doctor' },
    { value: 'physiotherapist', icon: '🧑‍⚕️', label: 'Physio' },
    { value: 'pharmacist', icon: '💊', label: 'Pharmacist' },
    { value: 'laboratory', icon: '🔬', label: 'Laboratory' }
  ];

  private mockUsers: { [key: string]: string } = {
    'doctor@example.com': 'doctor',
    'patient@example.com': 'patient',
    'physio@example.com': 'physiotherapist',
    'pharmacist@example.com': 'pharmacist',
    'lab@example.com': 'laboratory'
  };

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.isSignup = this.route.snapshot.data['signupMode'] || false;
  }

  selectRole(role: string) {
    this.selectedRole = role;
    this.uploadedDocument = null;
    this.showPharmacyErrors = false;
    this.showGeneralErrors = false;
  }

  isProfessionalRole(): boolean {
    return ['doctor', 'physiotherapist', 'pharmacist', 'laboratory'].includes(this.selectedRole);
  }

  getDocumentLabel(): string {
    const labels: { [key: string]: string } = {
      doctor: 'Medical Diploma / Certification',
      physiotherapist: 'Physiotherapy License / Certification',
      pharmacist: 'Pharmacy License / Certification',
      laboratory: 'Laboratory Accreditation / License'
    };
    return labels[this.selectedRole] || 'Certification';
  }

  getDocumentPlaceholder(): string {
    const placeholders: { [key: string]: string } = {
      doctor: 'Upload medical diploma',
      physiotherapist: 'Upload physiotherapy license',
      pharmacist: 'Upload pharmacy license',
      laboratory: 'Upload laboratory accreditation'
    };
    return placeholders[this.selectedRole] || 'Upload certification';
  }

  handleDocumentUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.uploadedDocument = input.files[0].name;
    }
  }

  toggleMode() {
    this.isSignup = !this.isSignup;
    this.uploadedDocument = null;
    this.showPharmacyErrors = false;
    this.showGeneralErrors = false;
  }

  handleSubmit() {
    this.showPharmacyErrors = false;
    this.showGeneralErrors = false;
    this.emailError = '';
    this.passwordError = '';
    this.phoneError = '';

    if (this.isSignup) {
      // Validate general fields
      let hasGeneralError = false;

      if (!this.fullName) {
        hasGeneralError = true;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email) {
        this.emailError = 'Email is required';
        hasGeneralError = true;
      } else if (!emailRegex.test(this.email)) {
        this.emailError = 'Please enter a valid email address';
        hasGeneralError = true;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!this.password) {
        this.passwordError = 'Password is required';
        hasGeneralError = true;
      } else if (!passwordRegex.test(this.password)) {
        this.passwordError = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';
        hasGeneralError = true;
      }

      if (hasGeneralError) {
        this.showGeneralErrors = true;
        return; // Stop submission
      }

      // Validate professional document
      if (this.isProfessionalRole() && !this.uploadedDocument) {
        this.showGeneralErrors = true;
        return; // Stop submission
      }

      if (this.selectedRole === 'pharmacist') {
        let hasPharmError = false;
        if (!this.pharmacyName) hasPharmError = true;
        if (!this.pharmacyAddress) hasPharmError = true;

        const phoneRegex = /^\+?[\d\s-]{8,}$/;
        if (!this.pharmacyPhone) {
          this.phoneError = 'Pharmacy Phone Number is required';
          hasPharmError = true;
        } else if (!phoneRegex.test(this.pharmacyPhone)) {
          this.phoneError = 'Please enter a valid phone number (e.g. +216 71 234 567)';
          hasPharmError = true;
        }

        if (hasPharmError) {
          this.showPharmacyErrors = true;
          return; // Stop submission
        }
      }

      // Prepare payload to send to backend
      const payload: any = {
        name: this.fullName,
        email: this.email,
        password: this.password,
        role: this.selectedRole.toUpperCase()
      };

      if (this.isProfessionalRole()) {
        payload.pharmacyLicense = this.uploadedDocument;
      }

      if (this.selectedRole === 'pharmacist') {
        payload.pharmacyName = this.pharmacyName;
        payload.pharmacyAddress = this.pharmacyAddress;
        payload.pharmacyPhone = this.pharmacyPhone;
      }

      console.log('Registration submitted:', payload);
      // TODO: Call API service with payload

      this.navigateToRole(this.selectedRole);
    } else {
      const role = this.mockUsers[this.email] || 'patient';
      this.navigateToRole(role);
    }
  }

  private navigateToRole(role: string) {
    // Persist role + a placeholder userId so Forum pages can read them
    localStorage.setItem('userRole', role);
    // TODO: replace with real user ID from auth when backend auth is implemented
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', '1');
    }
    const routeMap: { [key: string]: string } = {
      patient: '/patient/dashboard',
      doctor: '/doctor/dashboard',
      physiotherapist: '/physio/dashboard',
      pharmacist: '/pharmacist/dashboard',
      laboratory: '/laboratory/dashboard'
    };
    this.router.navigate([routeMap[role] || '/patient/dashboard']);
  }
}
