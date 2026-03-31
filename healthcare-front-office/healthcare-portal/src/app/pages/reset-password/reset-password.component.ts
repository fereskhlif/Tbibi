import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  newPassword = '';
  confirmPassword = '';
  loading = false;
  success = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  hasUppercase(): boolean { return /[A-Z]/.test(this.newPassword); }
  hasLowercase(): boolean { return /[a-z]/.test(this.newPassword); }
  hasDigit(): boolean { return /\d/.test(this.newPassword); }
  passwordsMatch(): boolean { return this.newPassword === this.confirmPassword && this.newPassword.length > 0; }

  isValid(): boolean {
    return (
      this.newPassword.length >= 8 &&
      this.hasUppercase() &&
      this.hasLowercase() &&
      this.hasDigit() &&
      this.passwordsMatch()
    );
  }

  onSubmit() {
    if (!this.token || !this.isValid()) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 400) {
          this.errorMessage = 'Invalid or expired reset link. Please request a new one.';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }
    });
  }

  goToLogin() { this.router.navigate(['/login']); }
  goToForgot() { this.router.navigate(['/forgot-password']); }
}
