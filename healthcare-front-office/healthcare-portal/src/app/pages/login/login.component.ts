import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../modules/patient/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare var google: any;

interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: string;
  profilePicture?: string;
  accountStatus: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // ── Form fields ───────────────────────────────────────
  isSignup = false;
  email = '';
  password = '';
  fullName = '';
  selectedRole: string = 'patient';
  uploadedDocument: string | null = null;

  // ── UI state ──────────────────────────────────────────
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // ── Role options ──────────────────────────────────────
  roles = [
    { value: 'patient',         icon: '👤',  label: 'Patient'     },
    { value: 'doctor',          icon: '👨‍⚕️', label: 'Doctor'      },
    { value: 'physiotherapist', icon: '🧑‍⚕️', label: 'Physio'      },
    { value: 'pharmacist',      icon: '💊',  label: 'Pharmacist'  },
    { value: 'laboratory',      icon: '🔬',  label: 'Laboratory'  }
  ];

  // ── Mapping frontend role → backend role ──────────────
  private roleToBackend: { [key: string]: string } = {
    patient:          'PATIENT',
    doctor:           'DOCTEUR',
    physiotherapist:  'KINE',
    pharmacist:       'PHARMASIS',
    laboratory:       'LABORATORY'
  };

  // ── Mapping backend role → frontend route ─────────────
  private roleToRoute: { [key: string]: string } = {
    ROLE_PATIENT:    '/patient/dashboard',
    ROLE_DOCTEUR:    '/doctor/dashboard',
    ROLE_KINE:       '/physio/dashboard',
    ROLE_PHARMASIS:  '/pharmacist/dashboard',
    ROLE_LABORATORY: '/laboratory/dashboard',
    ROLE_ADMIN:      '/admin/dashboard'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.isSignup = this.route.snapshot.data['signupMode'] || false;

    // ✅ AJOUTÉ : Réinitialise les champs à chaque visite
    this.email = '';
    this.password = '';
    this.fullName = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.uploadedDocument = null;

    // Si déjà connecté avec un token valide, rediriger SEULEMENT depuis la page login
    // Permet l'accès à la page signup même si connecté (pour créer des comptes multiples)
    if (this.authService.isLoggedIn() && !this.isSignup) {
      const role = this.authService.getCurrentUserRole();
      this.router.navigate([this.roleToRoute[role] || '/patient/dashboard']);
    }

    // ✅ Initialiser Google Sign-In
    if (!this.isSignup) {
      this.initializeGoogleSignIn();
    }
  }

  // ── Role selection ────────────────────────────────────
  selectRole(role: string) {
    this.selectedRole = role;
    this.uploadedDocument = null;
  }

  isProfessionalRole(): boolean {
    return ['doctor', 'physiotherapist', 'pharmacist', 'laboratory'].includes(this.selectedRole);
  }

  getDocumentLabel(): string {
    const labels: { [key: string]: string } = {
      doctor:           'Medical Diploma / Certification',
      physiotherapist:  'Physiotherapy License / Certification',
      pharmacist:       'Pharmacy License / Certification',
      laboratory:       'Laboratory Accreditation / License'
    };
    return labels[this.selectedRole] || 'Certification';
  }

  getDocumentPlaceholder(): string {
    const placeholders: { [key: string]: string } = {
      doctor:           'Upload medical diploma',
      physiotherapist:  'Upload physiotherapy license',
      pharmacist:       'Upload pharmacy license',
      laboratory:       'Upload laboratory accreditation'
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
    // Navigate to the proper route instead of just toggling the flag
    if (this.isSignup) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/signup']);
    }
  }

  // ── Submit ────────────────────────────────────────────
  handleSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isSignup) {
      this.handleRegister();
    } else {
      this.handleLogin();
    }
  }

  private handleLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          const route = this.roleToRoute[res.role] || '/patient/dashboard';
          this.router.navigate([route]);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid email or password. Please try again.';
          console.error('Login error:', err);
        }
      });
  }

  private handleRegister() {
    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.isProfessionalRole() && !this.uploadedDocument) {
      this.errorMessage = 'Please upload your professional certification.';
      return;
    }

    this.isLoading = true;

    const backendRole = this.roleToBackend[this.selectedRole];

    this.authService.register(this.fullName, this.email, this.password, backendRole)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Account created successfully! Please sign in.';
          setTimeout(() => this.toggleMode(), 1500);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error || 'Registration failed. Please try again.';
          console.error('Register error:', err);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ Google Sign-In
  initializeGoogleSignIn() {
    setTimeout(() => {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: 'TON_CLIENT_ID_ICI',
          callback: (response: any) => this.handleGoogleSignIn(response)
        });

        google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: 350,
            text: 'signin_with',
            shape: 'rectangular'
          }
        );
      }
    }, 500);
  }

  handleGoogleSignIn(response: any) {
    const idToken = response.credential;
    
    this.isLoading = true;
    this.errorMessage = '';

    // Envoyer le token au backend
    this.http.post<AuthResponse>('http://localhost:8088/auth/google', {
      idToken: idToken,
      role: 'ROLE_PATIENT' // Par défaut, créer un compte patient
    }).subscribe({
      next: (authResponse) => {
        this.isLoading = false;
        
        // Sauvegarder les informations dans localStorage
        localStorage.setItem('token', authResponse.token);
        localStorage.setItem('userId', authResponse.userId.toString());
        localStorage.setItem('userRole', authResponse.role);
        localStorage.setItem('userName', authResponse.name);
        if (authResponse.profilePicture) {
          localStorage.setItem('userProfilePicture', authResponse.profilePicture);
        }
        
        // Rediriger vers le dashboard approprié
        const route = this.roleToRoute[authResponse.role] || '/patient/dashboard';
        this.router.navigate([route]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Google authentication failed. Please try again.';
        console.error('Google authentication error:', err);
      }
    });
  }
}